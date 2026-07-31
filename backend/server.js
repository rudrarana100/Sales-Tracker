import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import axios from "axios";
import * as cheerio from "cheerio";

import authRoutes from "./routes/authRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

dotenv.config();

// Activate anti-bot stealth plugin for Puppeteer
puppeteer.use(StealthPlugin());

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://salestrackercrm.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

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

// High-Efficiency Google Maps Scraper Endpoint
app.post("/api/scrape-maps", async (req, res) => {
  const { query, location, limit = 10 } = req.body;

  if (!query || !location) {
    return res.status(400).json({ error: "Query and location are required." });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
        "--window-size=1280,800",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(
      `${query} in ${location}`
    )}`;

    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for the results feed container
    await page.waitForSelector('div[role="feed"]', { timeout: 15000 }).catch(() => null);

    // Smooth scroll down the feed to dynamically render listings
    await page.evaluate(async (maxItems) => {
      const feed = document.querySelector('div[role="feed"]');
      if (!feed) return;

      await new Promise((resolve) => {
        let totalScroll = 0;
        const timer = setInterval(() => {
          feed.scrollBy(0, 400);
          totalScroll += 400;
          const links = document.querySelectorAll('a[href*="/maps/place/"]');
          if (links.length >= maxItems || totalScroll >= 12000) {
            clearInterval(timer);
            resolve();
          }
        }, 400);
      });
    }, limit);

    // Extract place detail URLs from sidebar feed
    const placeUrls = await page.evaluate((maxItems) => {
      const links = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));
      return links.map((a) => a.href).slice(0, maxItems);
    }, limit);

    const scrapedLeads = [];

    // Deep inspect each listing directly for accurate phone, website, and name
    for (const url of placeUrls) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

        const leadData = await page.evaluate(() => {
          const nameEl = document.querySelector("h1");
          const name = nameEl ? nameEl.innerText.trim() : "";

          if (!name) return null;

          // Stable ARIA-attribute selectors for phone & website
          const phoneBtn = document.querySelector('button[data-tooltip*="phone"], button[aria-label*="Phone"]');
          let phone = "";
          if (phoneBtn) {
            const ariaLabel = phoneBtn.getAttribute("aria-label") || "";
            phone = ariaLabel.replace(/Phone:\s*/i, "").trim();
          }

          const websiteLink = document.querySelector('a[data-tooltip*="website"], a[aria-label*="Website"]');
          const website = websiteLink ? websiteLink.href : "";

          const categoryBtn = document.querySelector('button[jsaction*="category"]');
          const category = categoryBtn ? categoryBtn.innerText.trim() : "";

          return {
            lead_name: name,
            phone: phone,
            website: website,
            business_type: category,
            google_maps_link: window.location.href,
          };
        });

        // Filter out incomplete/bad listings
        if (leadData && (leadData.phone || leadData.website)) {
          let scrapedEmail = "";
          if (leadData.website) {
            scrapedEmail = await extractEmailFromWebsite(leadData.website);
          }

          scrapedLeads.push({
            ...leadData,
            email: scrapedEmail,
            business_type: leadData.business_type || query,
            status: "cold",
            last_outcome: "scraped_from_maps",
          });
        }
      } catch (err) {
        console.warn(`Skipped listing at ${url}`);
      }
    }

    await browser.close();

    return res.json({
      success: true,
      count: scrapedLeads.length,
      data: scrapedLeads,
    });
  } catch (error) {
    if (browser) await browser.close();
    console.error("Scraping Error:", error);
    return res.status(500).json({ error: "Failed to scrape Google Maps.", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});