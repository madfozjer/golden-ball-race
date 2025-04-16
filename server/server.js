import express from "express"; //WHEN DEPLOYED, NEED A PROXY FOR THAT
import dotenv from "dotenv";
import cors from "cors";
import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import axios from "axios";
const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/scorers", (req, res) => {});

app.get("/api/standings", (req, res) => {});

app.get("/api/rating", async (req, res) => {
  res.set("Content-Type", "text/html");

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url =
      "https://www.fotmob.com/uk/leagues/42/stats/season/24110/players/rating";

    await page.goto(url, { waitUntil: "networkidle0" });

    const result = {};
    const names = await page.$$eval(
      'span[class*="TeamOrPlayerName"]',
      (spans) => {
        return spans.map((span) => span.innerHTML.trim());
      }
    );

    const ratings = await page.$$eval('span[class*="StatValue"]', (spans) => {
      return spans.map((span) => span.querySelector("span").innerHTML.trim());
    });

    names.forEach((name, index) => {
      result[name] = Math.floor(
        parseFloat(ratings[index].replace(/,/g, ".")) * 100
      );
    });

    // Close the browser after scraping
    await browser.close();

    res.json(result);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/teamcheck", async (req, res) => {
  res.set("Content-Type", "text/html");

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url = "https://www.fotmob.com/leagues/42/playoff/champions-league";

    await page.goto(url, { waitUntil: "networkidle0" });

    const teams = await page.$$eval('span[class*="TeamName"]', (spans) => {
      return spans.map((span) => span.innerHTML.trim());
    });

    // Close the browser after scraping
    await browser.close();

    const result = {};

    for (const e of teams) {
      result[e] = result[e] ? result[e] + 1 : 1;
    }

    const data = await getJSON("teams.json");
    delete result.TBD;

    const updated = Object.keys(result).reduce((acc, abbr) => {
      // Find the corresponding team name from the abbreviation
      const team = data.find((t) => t.team_abbreviation === abbr);
      if (team) {
        acc[team.team_name] = result[abbr]; // Set full team name as the key
      }
      return acc;
    }, {});

    res.json(teams);
  } catch (error) {
    res.send(error);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

async function readJsonFile(filepath, encoding = "utf8") {
  const file = await fs.readFile(filepath, encoding);
  return JSON.parse(file);
}

async function getJSON(file) {
  const filepath = path.join(__dirname, file);
  return await readJsonFile(filepath);
}
