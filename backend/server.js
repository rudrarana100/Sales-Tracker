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
    origin: true, 
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
      error: "Job session expired due to server restart.",
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
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-size=1280,800",
      ],
      defaultViewport: null,
      headless: false, // Keep false while testing on localhost
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || await chromium.executablePath(),
      timeout: 60000, 
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");

    const searchQuery = `${query} in ${location}`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}?hl=en`;
    
    console.log(`[Job ${jobId}] Phase 1: Basic lists from ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    
    await page.waitForSelector('div[role="feed"], h1', { timeout: 25000 }).catch(() => null);

    const collectedLinks = new Map();
    let scrollAttempts = 0;
    const maxScrolls = Math.max(30, Math.ceil(targetCount / 3));

    while (collectedLinks.size < targetCount && scrollAttempts < maxScrolls) {
      scrollAttempts++;

      const rawLinks = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('div[role="article"]');

        items.forEach((item) => {
          let name = "";
          let link = "";

          const linkEl = item.querySelector('a');
          if (linkEl) link = linkEl.href;

          name = item.getAttribute("aria-label");
          if (!name) {
            const h1 = item.querySelector(".fontHeadlineSmall, h1, h2");
            if (h1) name = h1.innerText.trim();
          }

          if (name && link) {
            results.push({ lead_name: name, google_maps_link: link });
          }
        });
        return results;
      });

      for (const lead of rawLinks) {
        if (collectedLinks.size >= targetCount) break;
        if (!collectedLinks.has(lead.google_maps_link)) {
          collectedLinks.set(lead.google_maps_link, lead);
        }
      }

      const scrolled = await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]');
        if (feed) {
          feed.scrollBy(0, 1500);
          return true;
        }
        return false;
      });

      if (!scrolled) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    const leadsToEnrich = Array.from(collectedLinks.values()).slice(0, targetCount);
    console.log(`[Job ${jobId}] Phase 2: Deep Extraction for ${leadsToEnrich.length} leads...`);
    
    const detailPage = await browser.newPage();
    await detailPage.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36");

    job.leads = [];
    job.progress = 0;

    for (const basicLead of leadsToEnrich) {
       try {
           await detailPage.goto(basicLead.google_maps_link + "&hl=en", { waitUntil: 'domcontentloaded', timeout: 35000 });
           
           // Ensure the side panel is fully loaded
           await detailPage.waitForSelector('h1', { timeout: 10000 }).catch(() => null);
           await new Promise((r) => setTimeout(r, 2000)); 

           const enrichedData = await detailPage.evaluate(() => {
               let phone = null;
               let website = null;
               
               // 1. Standard Extraction (Fastest if available)
               const telLink = document.querySelector('a[href^="tel:"]');
               if (telLink) phone = telLink.getAttribute('href').replace('tel:', '');
               
               const webLink = document.querySelector('a[data-item-id="authority"]');
               if (webLink) website = webLink.href;

               // 2. Visual Line-By-Line Scanning (Defeats the Hotel/Cafe layout)
               const visibleTextLines = document.body.innerText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
               
               for (const line of visibleTextLines) {
                   // Match standalone websites (e.g., "hotelswarnpalace.com")
                   if (!website && /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/.test(line)) {
                       const lowerLine = line.toLowerCase();
                       if (!lowerLine.includes('google') && !lowerLine.includes('justdial') && !lowerLine.includes('agoda') && !lowerLine.includes('makemytrip')) {
                           website = line;
                       }
                   }

                   // Match standalone phone numbers (e.g., "076177 66602")
                   if (!phone) {
                       const isPhoneFormat = /^[+\d\s\-\(\)]+$/.test(line);
                       const digitsOnly = line.replace(/\D/g, '');
                       
                       if (isPhoneFormat && digitsOnly.length >= 8 && digitsOnly.length <= 15) {
                           phone = line;
                       }
                   }

                   if (phone && website) break; // Exit early if both are found
               }

               return { phone, website };
           });
           
           let finalPhone = enrichedData.phone;
           if (finalPhone) {
               finalPhone = finalPhone.replace(/[^\d+]/g, '');
               if (finalPhone.length < 8) finalPhone = null;
           }

           let finalWeb = enrichedData.website;
           if (finalWeb && !finalWeb.startsWith('http')) finalWeb = `https://${finalWeb}`;

           job.leads.push({
               lead_name: basicLead.lead_name,
               phone: finalPhone || null,
               website: finalWeb || null,
               google_maps_link: basicLead.google_maps_link,
               business_type: query, 
               status: "cold",
           });
           
           job.progress = job.leads.length; 

       } catch (err) {
           console.error(`Detail Extraction Error for ${basicLead.lead_name}:`, err.message);
           job.leads.push({
               ...basicLead,
               phone: null,
               website: null,
               business_type: query,
               status: "cold",
           });
           job.progress = job.leads.length;
       }
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