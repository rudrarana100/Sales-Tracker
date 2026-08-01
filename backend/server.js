import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import axios from "axios";
import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";

import authRoutes from "./routes/authRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

dotenv.config();

// Activate anti-bot stealth plugin for Puppeteer
puppeteer.use(StealthPlugin());

const app = express();

// Allow origins dynamically for development & production
app.use(
  cors({
    origin: "*", // Allows requests from Vercel frontend and local testing
    credentials: true,
  })
);

app.use(express.json());

// In-memory store for active scraping jobs
const scrapingJobs = {};

// Sub-location keywords used to expand searches beyond Google Maps' 120-item display limit
const SUB_LOCATIONS = [
  "Main Market",
  "Center",
  "Zone 1",
  "Zone 2",
  "North",
  "South",
  "Industrial Area",
  "Commercial Hub",
];

// Helper function: Extracts contact email from scraped business websites
async function extractEmailFromWebsite(websiteUrl) {
  if (!websiteUrl) return "";
  try {
    const url = websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const htmlText = $.html();

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = htmlText.match(emailRegex) || [];

    const cleanEmails = matches.filter(
      (email) =>
        !email.endsWith(".png") &&
        !email.endsWith(".jpg") &&
        !email.endsWith(".jpeg") &&
        !email.endsWith(".svg") &&
        !email.includes("sentry") &&
        !email.includes("w3.org")
    );

    return cleanEmails[0] || "";
  } catch (error) {
    return "";
  }
}

// Health Check Routes
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend connected successfully!",
  });
});

// Existing Routes
app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

// 1. Start High-Volume Asynchronous Scraping Job
app.post("/api/scrape-maps/start", async (req, res) => {
  const { query, location, targetCount = 50 } = req.body;

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

  // Run Puppeteer scraper in the background
  runBackgroundScraper(jobId, query, location, targetCount);

  // Return Job ID immediately to avoid HTTP timeouts on the client
  return res.json({ success: true, jobId });
});

// 2. Poll Scraping Job Progress
app.get("/api/scrape-maps/status/:jobId", (req, res) => {
  const job = scrapingJobs[req.params.jobId];
  if (!job) {
    return res.status(404).json({ error: "Job not found." });
  }
  return res.json(job);
});

// Async Background Scraper Core
async function runBackgroundScraper(jobId, query, location, targetCount) {
  const job = scrapingJobs[jobId];
  let browser;

  try {
    // ✅ Updated with essential Linux container flags for Render deployment
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
        "--window-size=1280,800",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const searchQueries = [
      `${query} in ${location}`,
      ...SUB_LOCATIONS.map((sub) => `${query} in ${sub}, ${location}`),
    ];

    const collectedLeads = new Map(); // Store by phone or name to avoid duplicate leads

    for (const searchQuery of searchQueries) {
      if (collectedLeads.size >= targetCount) break;

      const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 }).catch(() => null);

      await page.waitForSelector('div[role="feed"]', { timeout: 10000 }).catch(() => null);

      // Scroll sidebar to render dynamic listings
      await page.evaluate(async () => {
        const feed = document.querySelector('div[role="feed"]');
        if (!feed) return;
        for (let i = 0; i < 12; i++) {
          feed.scrollBy(0, 800);
          await new Promise((r) => setTimeout(r, 500));
        }
      });

      const placeUrls = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));
        return Array.from(new Set(links.map((a) => a.href)));
      });

      for (const url of placeUrls) {
        if (collectedLeads.size >= targetCount) break;

        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

          const leadData = await page.evaluate(() => {
            const nameEl = document.querySelector("h1");
            const name = nameEl ? nameEl.innerText.trim() : "";
            if (!name) return null;

            const phoneBtn = document.querySelector('button[data-tooltip*="phone"], button[aria-label*="Phone"]');
            let phone = phoneBtn ? (phoneBtn.getAttribute("aria-label") || "").replace(/Phone:\s*/i, "").trim() : "";

            const websiteLink = document.querySelector('a[data-tooltip*="website"], a[aria-label*="Website"]');
            let website = websiteLink ? websiteLink.href : "";
            if (website.includes("/url?q=")) {
              const match = website.match(/\/url\?q=([^&]+)/);
              if (match && match[1]) website = decodeURIComponent(match[1]);
            }

            const categoryBtn = document.querySelector('button[jsaction*="category"]');
            const category = categoryBtn ? categoryBtn.innerText.trim() : "";

            return {
              lead_name: name,
              phone,
              website,
              business_type: category,
              google_maps_link: window.location.href,
            };
          });

          if (leadData && (leadData.phone || leadData.website)) {
            const key = leadData.phone || leadData.lead_name;
            if (!collectedLeads.has(key)) {
              let scrapedEmail = "";
              if (leadData.website) {
                scrapedEmail = await extractEmailFromWebsite(leadData.website);
              }

              collectedLeads.set(key, {
                ...leadData,
                email: scrapedEmail,
                business_type: leadData.business_type || query,
                status: "cold",
                last_outcome: "scraped_from_maps",
              });

              // Stream live updates directly to job state
              job.leads = Array.from(collectedLeads.values());
              job.progress = job.leads.length;
            }
          }
        } catch (e) {
          // Skip individual failed listing
        }
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