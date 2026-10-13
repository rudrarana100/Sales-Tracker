import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

import authRoutes from "./routes/authRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

dotenv.config();

// Initialize Supabase using your exact VITE_ variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABSE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Warning: Supabase credentials missing in .env!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findLocalChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p)) || null;
}

app.get("/", (req, res) => res.send("Backend Running 🚀"));
app.get("/api/test", (req, res) => res.json({ message: "Backend connected successfully!" }));

app.use("/auth", authRoutes);
app.use("/calendar", calendarRoutes);

app.delete("/api/collections/:name", async (req, res) => {
  const collectionName = req.params.name;
  try {
    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("import_batch", collectionName);

    if (error) throw error;

    res.json({ success: true, message: `Deleted collection: ${collectionName}` });
  } catch (error) {
    console.error("Delete Collection Error:", error);
    res.status(500).json({ error: error.message });
  }
});

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
      expired: true,
    });
  }
  return res.json(job);
});

function normalizePhone(raw) {
  if (!raw) return null;

  const hasPlus = raw.trim().startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (hasPlus && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  if (digits.length >= 8 && digits.length <= 15) {
    return digits;
  }
  return null;
}

function normalizeWebsite(raw) {
  if (!raw) return null;
  let site = raw.trim();
  if (!site) return null;
  if (!/^https?:\/\//i.test(site)) site = `https://${site}`;

  const blocked = [
    "google.",
    "justdial",
    "agoda",
    "makemytrip",
    "booking.com",
    "tripadvisor",
    "goibibo",
    "zomato",
    "swiggy",
    "mmt.",
    "cleartrip",
    "expedia",
    "facebook.com",
    "instagram.com",
  ];
  const lower = site.toLowerCase();
  if (blocked.some((b) => lower.includes(b))) return null;

  return site;
}

async function extractPlaceDetails(page) {
  return page.evaluate(() => {
    let phone = null;
    let website = null;

    const phoneBtn = document.querySelector('button[data-item-id^="phone:tel:"], a[data-item-id^="phone:tel:"]');
    if (phoneBtn) {
      phone = (phoneBtn.getAttribute("data-item-id") || "").replace("phone:tel:", "");
      if (!phone) {
        phone = (phoneBtn.getAttribute("aria-label") || "").replace(/^Phone:\s*/i, "");
      }
    }
    if (!phone) {
      const tel = document.querySelector('a[href^="tel:"]');
      if (tel) phone = tel.getAttribute("href").replace("tel:", "");
    }

    const webEl = document.querySelector('a[data-item-id="authority"], button[data-item-id="authority"]');
    if (webEl) {
      website = webEl.href || (webEl.getAttribute("aria-label") || "").replace(/^Website:\s*/i, "");
    }

    if (!phone || !website) {
      const panel =
        document.querySelector('div[role="main"][aria-label]') ||
        document.querySelector('div[role="main"]');
      const scope = panel || document.body;

      const labelled = scope.querySelectorAll("[aria-label]");
      for (const el of labelled) {
        const label = el.getAttribute("aria-label") || "";
        if (!phone && /^Phone:/i.test(label)) phone = label.replace(/^Phone:\s*/i, "");
        if (!website && /^Website:/i.test(label)) website = label.replace(/^Website:\s*/i, "");
        if (phone && website) break;
      }

      if (!phone || !website) {
        const lines = scope.innerText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        const blocked = [
          "google",
          "justdial",
          "agoda",
          "makemytrip",
          "booking.com",
          "tripadvisor",
          "goibibo",
          "zomato",
          "swiggy",
        ];

        for (const line of lines) {
          if (
            !website &&
            /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/\S*)?$/i.test(line) &&
            !blocked.some((b) => line.toLowerCase().includes(b))
          ) {
            website = line;
          }

          if (!phone && /^[+\d][\d\s\-()]{7,18}$/.test(line)) {
            const d = line.replace(/\D/g, "");
            if (d.length >= 10 && d.length <= 13) phone = line;
          }

          if (phone && website) break;
        }
      }
    }

    return { phone, website };
  });
}

async function scrapePlaceDetails(detailPage, link) {
  await detailPage.goto(`${link}&hl=en`, {
    waitUntil: "domcontentloaded",
    timeout: 35000,
  });

  await detailPage
    .waitForSelector('button[data-item-id], a[data-item-id], div[role="main"] h1', {
      timeout: 12000,
    })
    .catch(() => null);
  await sleep(2500);

  let data = await extractPlaceDetails(detailPage);

  if (!data.phone && !data.website) {
    await detailPage.reload({ waitUntil: "domcontentloaded", timeout: 35000 }).catch(() => null);
    await detailPage
      .waitForSelector('button[data-item-id], a[data-item-id]', { timeout: 12000 })
      .catch(() => null);
    await sleep(3500);
    data = await extractPlaceDetails(detailPage);
  }

  if (!data.phone && !data.website) {
    const title = await detailPage.title().catch(() => "");
    console.log(`[debug] EMPTY RESULT -> title: "${title}" | url: ${detailPage.url().slice(0, 150)}`);
  }

  return data;
}

async function runBackgroundScraper(jobId, query, location, targetCount) {
  const job = scrapingJobs[jobId];
  let browser;

  const isProd = process.env.NODE_ENV === "production";

  try {
    browser = await puppeteer.launch({
      args: [
        ...(isProd ? chromium.args : []),
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-size=1280,800",
      ],
      defaultViewport: isProd || process.env.SHOW_BROWSER !== "true" ? { width: 1280, height: 800 } : null,
      headless: isProd ? chromium.headless ?? "new" : process.env.SHOW_BROWSER === "true" ? false : "new",
      executablePath: isProd
        ? process.env.PUPPETEER_EXECUTABLE_PATH || (await chromium.executablePath())
        : findLocalChrome() || (await chromium.executablePath()),
      timeout: 60000,
    });

    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);

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

          const linkEl = item.querySelector('a[href*="/maps/place/"]') || item.querySelector("a");
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
      await sleep(1500);
    }

    const leadsToEnrich = Array.from(collectedLinks.values()).slice(0, targetCount);
    console.log(`[Job ${jobId}] Phase 2: Deep Extraction for ${leadsToEnrich.length} leads...`);

    const detailPage = await browser.newPage();
    await detailPage.setUserAgent(USER_AGENT);
    await detailPage.bringToFront();

    job.leads = [];
    job.progress = 0;

    for (const basicLead of leadsToEnrich) {
      try {
        const enrichedData = await scrapePlaceDetails(detailPage, basicLead.google_maps_link);

        const finalPhone = normalizePhone(enrichedData.phone);
        const finalWeb = normalizeWebsite(enrichedData.website);

        if (!finalPhone) {
          console.log(`[Job ${jobId}] No phone found for "${basicLead.lead_name}"`);
        }

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

    console.log(`\n[Job ${jobId}] DONE. Results (${job.leads.length} leads):`);
    for (const l of job.leads) {
      console.log(`  - ${l.lead_name} | phone: ${l.phone} | website: ${l.website}`);
    }
    console.log("");
  } catch (error) {
    if (browser) await browser.close().catch(() => null);
    console.error("Job Scraping Error:", error);
    job.status = "failed";
    job.error = error.message;
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (process id ${process.pid})`);
});