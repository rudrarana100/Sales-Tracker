import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium";
import { v4 as uuidv4 } from "uuid";

import authRoutes from "./routes/authRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

dotenv.config();

puppeteer.use(StealthPlugin());

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

const scrapingJobs = {};

// Health Checks
app.get("/", (req, res) => res.send("Backend Running 🚀"));
app.get("/api/test", (req, res) => res.json({ message: "Backend connected successfully!" }));

app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

// Start Scraper Job
app.post("/api/scrape-maps/start", async (req, res) => {
  const { query, location, targetCount = 20 } = req.body;

  if (!query || !location) {
    return res.status(400).json({ error: "Query and location are required." });
  }

  const jobId = uuidv4();
  scrapingJobs[jobId] = {
    id: jobId,
    status: "processing",
    progress: 0,
    target: targetCount,
    leads: [],
    error: null,
  };

  runBackgroundScraper(jobId, query, location, Number(targetCount));

  return res.json({ success: true, jobId });
});

// Check Progress Status with Fallback for expired/restarted memory jobs
app.get("/api/scrape-maps/status/:jobId", (req, res) => {
  const job = scrapingJobs[req.params.jobId];
  if (!job) {
    return res.status(404).json({ 
      error: "Job session expired due to server restart. Please start scraping again.",
      expired: true 
    });
  }
  return res.json(job);
});

// Highly Efficient Scraper Implementation
async function runBackgroundScraper(jobId, query, location, targetCount) {
  const job = scrapingJobs[jobId];
  let browser;

  try {
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid Google Maps bot blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    const searchQuery = `${query} in ${location}`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    
    console.log(`[Job ${jobId}] Opening: ${searchUrl}`);
    
    // 60 seconds timeout to prevent cold start issues
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Wait for feed container
    await page.waitForSelector('div[role="feed"], h1', { timeout: 25000 }).catch(() => null);

    const collectedLeads = new Map();
    let scrollAttempts = 0;
    const maxScrolls = Math.max(25, Math.ceil(targetCount / 3)); // Dynamic scrolls based on target

    while (collectedLeads.size < targetCount && scrollAttempts < maxScrolls) {
      scrollAttempts++;

      // Extract listings with resilient fallback selectors
      const rawLeads = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('div[role="article"], a[href*="/maps/place/"]');

        items.forEach((item) => {
          let name = "";
          let phone = "";
          let link = "";

          const linkEl = item.tagName === "A" ? item : item.querySelector('a[href*="/maps/place/"]');
          if (linkEl) link = linkEl.href;

          const ariaLabel = item.getAttribute("aria-label") || linkEl?.getAttribute("aria-label");
          if (ariaLabel) name = ariaLabel;

          if (!name) {
            const h1 = item.querySelector("h1, h2, .fontHeadlineSmall, span.OSrXXb");
            if (h1) name = h1.innerText.trim();
          }

          // Extract phone number patterns from text block
          const fullText = item.innerText || "";
          const phoneMatch = fullText.match(/(\+?\d{1,4}[\s-]?)?\(?\d{2,5}\)?[\s-]?\d{3,5}[\s-]?\d{3,5}/);
          if (phoneMatch) phone = phoneMatch[0];

          if (name && link) {
            results.push({
              lead_name: name,
              phone: phone || null,
              website: null,
              google_maps_link: link,
            });
          }
        });

        return results;
      });

      for (const lead of rawLeads) {
        if (collectedLeads.size >= targetCount) break;

        if (!collectedLeads.has(lead.google_maps_link)) {
          collectedLeads.set(lead.google_maps_link, {
            ...lead,
            business_type: query,
            email: null,
            status: "cold",
            last_outcome: "scraped_from_maps",
          });
        }
      }

      job.leads = Array.from(collectedLeads.values()).slice(0, targetCount);
      job.progress = job.leads.length;

      if (collectedLeads.size >= targetCount) break;

      // Efficient feed container scroll
      const scrolled = await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) {
          feed.scrollBy(0, 1500);
          return true;
        }
        window.scrollBy(0, 1500);
        return false;
      });

      if (!scrolled && scrollAttempts > 5) break;
      await new Promise((r) => setTimeout(r, 2000)); // Delay to let Google Maps render items smoothly
    }

    await browser.close();
    job.status = "completed";
  } catch (error) {
    if (browser) await browser.close();
    console.error("Job Scraping Error:", error);
    job.status = "failed";
    job.error = error.message;
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});