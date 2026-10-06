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

app.get("/", (req, res) => res.send("Backend Running 🚀"));
app.get("/api/test", (req, res) => res.json({ message: "Backend connected successfully!" }));

app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

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
      timeout: 60000, 
    });

    const page = await browser.newPage();
    
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    const searchQuery = `${query} in ${location}`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    
    console.log(`[Job ${jobId}] Opening: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

    await page.waitForSelector('div[role="feed"], h1', { timeout: 25000 }).catch(() => null);

    const collectedLeads = new Map();
    let scrollAttempts = 0;
    const maxScrolls = Math.max(25, Math.ceil(targetCount / 3));

    while (collectedLeads.size < targetCount && scrollAttempts < maxScrolls) {
      scrollAttempts++;

      const rawLeads = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('div[role="article"]');

        items.forEach((item) => {
          let name = "";
          let phone = "";
          let link = "";
          let website = "";

          const linkEl = item.querySelector('a');
          if (linkEl) link = linkEl.href;

          name = item.getAttribute("aria-label");
          if (!name) {
            const h1 = item.querySelector(".fontHeadlineSmall, h1, h2");
            if (h1) name = h1.innerText.trim();
          }

          const fullText = item.innerText || "";

          const buttons = Array.from(item.querySelectorAll('button'));
          const phoneBtn = buttons.find(btn => {
            const aria = (btn.getAttribute('aria-label') || "").toLowerCase();
            const tooltip = (btn.getAttribute('data-tooltip') || "").toLowerCase();
            return aria.includes('phone') || tooltip.includes('phone') || aria.includes('+');
          });
          
          if (phoneBtn) {
            phone = (phoneBtn.getAttribute('aria-label') || "").replace(/phone:?\s*/i, '').trim();
          }

          if (!phone) {
            const phoneRegex = /(?:\+?\d{1,3}[\-\s]?)?\(?\d{2,4}\)?[\-\s]?\d{3,4}[\-\s]?\d{3,4}/g;
            const phoneMatches = fullText.match(phoneRegex);
            
            if (phoneMatches) {
              const validPhones = phoneMatches.filter(m => m.replace(/\D/g, '').length >= 8);
              if (validPhones.length > 0) phone = validPhones[validPhones.length - 1].trim();
            }
          }

          if (phone) phone = phone.replace(/[^\d+]/g, '');

          const allLinks = Array.from(item.querySelectorAll('a'));
          const webLink = allLinks.find(a => 
            a.getAttribute('data-value') === 'Website' || 
            (a.href && !a.href.includes('google.com') && a.innerText.toLowerCase().includes('website'))
          );
          
          if (webLink) {
            website = webLink.href;
          } else {
             const webMatch = fullText.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/);
             if (webMatch) {
               const domain = webMatch[0].toLowerCase();
               if (!domain.includes('google') && !domain.includes('review') && !domain.includes('justdial')) {
                 website = domain.startsWith('http') ? domain : `https://${domain}`;
               }
             }
          }

          if (name && link) {
            results.push({
              lead_name: name,
              phone: phone || null,
              website: website || null,
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
      await new Promise((r) => setTimeout(r, 2000));
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