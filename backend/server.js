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
      // VISUAL DEBUG MODE FOR LOCALHOST: False means the browser will physically open
      headless: false, 
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
           
           // LOCALHOST FIX: Wait explicitly for the sidebar containing info to load
           await detailPage.waitForSelector('div[role="main"]', { timeout: 10000 }).catch(() => null);
           await new Promise((r) => setTimeout(r, 2000)); // Let the phone/website icons render

           const enrichedData = await detailPage.evaluate(() => {
               let phone = null;
               let website = null;
               
               // Target the specific class Google uses for info items (phone, address, web)
               const infoItems = document.querySelectorAll('.rogA2c, [data-item-id]');
               
               for (const item of infoItems) {
                   const text = item.innerText || '';
                   const dataId = item.getAttribute('data-item-id') || '';
                   
                   // Find Phone
                   if (!phone) {
                       if (dataId.includes('phone:tel:')) {
                           phone = dataId.replace('phone:tel:', '');
                       } else if (text.match(/(?:\+?91[\-\s]?)?[0-9]{3,5}[\-\s]?[0-9]{3,5}[\-\s]?[0-9]{0,5}/)) {
                           // If the text inside the icon block looks like a number
                           phone = text;
                       }
                   }

                   // Find Website
                   if (!website) {
                       if (dataId === 'authority') {
                           const aTag = item.closest('a') || item.querySelector('a');
                           if (aTag) website = aTag.href;
                       } else if (text.toLowerCase().includes('.com') || text.toLowerCase().includes('.in')) {
                           website = text;
                       }
                   }
               }

               return { phone, website };
           });
           
           let finalPhone = enrichedData.phone;
           if (finalPhone) {
               // Keep only numbers and '+'
               finalPhone = finalPhone.replace(/[^\d+]/g, '');
               // Filter out junk short numbers
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