import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";

async function getTopScorers() {
  try {
    const response = await fetch(`http://localhost:5000/api/scorers`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(`Fetch scorers is unsuccesful.`, error);
  }
}

async function getStandings() {
  try {
    const response = await fetch(`http://localhost:5000/api/standings`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(`Fetch standings is unsuccesful.`, error);
  }
}

async function checkAPI() {
  try {
    const response = await fetch(`http://localhost:5000/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(`Fetch standings is unsuccesful.`, error);
  }
}

async function getRatings() {
  try {
    const response = await fetch(`http://localhost:5000/api/rating`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(`Fetch ratings is unsuccesful.`, error);
  }
}

async function getTeams() {
  try {
    const response = await fetch(`http://localhost:5000/api/teamcheck`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.error(`Fetch teams is unsuccesful.`, error);
  }
}

async function matchTeams(t, p) {
  const request = new URLSearchParams({
    teams: JSON.stringify(t),
    players: JSON.stringify(p),
  }).toString();
  try {
    const response = await fetch(
      `http://localhost:5000/api/matchteams?${request}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(`Match teams is unsuccesful.`, error);
  }
}

async function runTeamMatching() {
  try {
    const players = await getRatings();
    const teams = await getTeams();
    matchTeams(teams, players);
  } catch (error) {
    console.error("Error during team matching:", error);
  }
}

checkAPI();
runTeamMatching();

createApp(App).mount("#app");
