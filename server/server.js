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

async function getPlayerTeams() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    const url =
      "https://www.fotmob.com/en/leagues/42/stats/season/24110/players/rating";

    await page.goto(url, { waitUntil: "networkidle0" });
    const links = await page.evaluate(() => {
      // Find the div with the class "LeagueSeasonStatsTableCSS"
      const targetDiv = document.querySelector(
        'div[class*="LeagueSeasonStatsTableCSS"]'
      );

      if (!targetDiv) return []; // Return an empty array if the div is not found

      // Find all <a> tags inside that div
      const anchorTags = targetDiv.querySelectorAll("a");
      const hrefs = [];

      anchorTags.forEach((anchor) => {
        hrefs.push(anchor.href); // Collect the href attribute of each link
      });

      return hrefs; // Return the array of hrefs
    });

    const result = {};

    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      await page.goto(link, { waitUntil: "domcontentloaded" });

      const content = await page.evaluate(() => {
        const targetDiv = document.querySelector('div[class*="TeamCSS"]');
        if (!targetDiv) return "";
        targetDiv.querySelectorAll("img").forEach((img) => img.remove());
        return targetDiv.textContent.trim();
      });

      result[i] = content;
    }

    await browser.close();
    console.log("Player teams were fetched succesfully");
    return result;
  } catch (error) {
    console.error(error);
  }
}

async function getRatings() {
  //10 pages
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url =
      "https://www.fotmob.com/en/leagues/42/stats/season/24110/players/rating";

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

    //getDomesticRatings() 4 pages

    const potm = await page.$$eval(
      'span[class*="css-lylvvy-SubStat"',
      (spans) => {
        return spans.map((span) =>
          parseInt(span.querySelector("span").innerHTML.trim())
        );
      }
    );

    names.forEach((name, index) => {
      result[name] = Math.floor(
        parseFloat(ratings[index].replace(/,/g, ".")) * 50
      );
      result[name] += Math.floor(potm[index] * 7.5);
    });

    const teams = await getPlayerTeams();

    Object.keys(result).forEach((key, index) => {
      result[key] = { score: result[key], team: teams[index] };
    });

    // Close the browser after scraping
    await browser.close();
    const updatedResult = await getGA(result);

    console.log("Player ratings were fetched succesfully");
    return updatedResult;
  } catch (error) {
    console.error(error);
  }
}

async function getGA(top10) {
  //3 pages
  //rewrite with full data
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const url =
      "https://www.fotmob.com/uk/leagues/42/stats/season/24110/players/_goals_and_goal_assist/champions-league";

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

    //getDomesticGA 2 pages

    names.forEach((name, index) => {
      if (Object.keys(top10).includes(name)) {
        top10[name].score += ratings[index] * 25;
      }
    });

    // Close the browser after scraping
    await browser.close();

    console.log("G+A statistics were fetched succesfully");
    return top10;
  } catch (error) {
    console.error(error);
  }
}

async function getTeams() {
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
    //getDomesticTeams()

    const updated = Object.keys(result).reduce((acc, abbr) => {
      // Find the corresponding team name from the abbreviation
      const team = data.find((t) => t.team_abbreviation === abbr);
      if (team) {
        acc[team.team_name] = result[abbr]; // Set full team name as the key
      }
      return acc;
    }, {});

    await browser.close();
    console.log("Teams were fetched succesfully");
    return updated;
  } catch (error) {
    console.error(error);
  }
}

async function matchTeams(t, p) {
  try {
    const teams = t;
    const players = p;

    Object.keys(players).forEach((playerKey) => {
      const teamExists = Object.keys(teams).includes(players[playerKey].team);

      if (teamExists) {
        players[playerKey].score += Math.floor(
          31.25 * Math.pow(2, teams[players[playerKey].team])
        );
      }
    });

    const sortedPlayers = Object.entries(players)
      .sort(([, a], [, b]) => b.score - a.score)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    console.log("Players and teams were matched succesfully");
    return sortedPlayers;
  } catch (error) {
    console.error(error);
  }
}

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

app.get("/api/getdata", async (req, res) => {
  try {
    const data = await fs.readFile("data.json", "utf8");
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (err) {
    console.error("Error reading or parsing data.json:", err);
    res.status(500).send("Error reading or parsing data");
  }
});

async function fetchData() {
  //make this multipage fetch + add domestic leagues
  try {
    const players = await getRatings();
    const teams = await getTeams();
    const result = await matchTeams(teams, players);
    fs.writeFile(
      "data.json",
      JSON.stringify(result, null, 2),
      "utf8",
      (err) => {
        if (err) {
          console.error("Error writing file:", err);
        } else {
          console.log("File written successfully.");
        }
      }
    );
    console.log("Data was fetched succesfully");
  } catch (error) {
    console.error("Error during data fetching:", error);
  }
}

fetchData();
