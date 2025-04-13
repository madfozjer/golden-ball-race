import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
const app = express();
app.use(cors());
app.use(express.json()); // to parse JSON bodies
const port = 5000;

dotenv.config();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const myHeaders = new Headers();
myHeaders.append("X-Auth-Token", process.env.API_KEY);

const requestOptions = {
  method: "GET",
  headers: myHeaders,
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/scorers", (req, res) => {
  fetch(
    "http://api.football-data.org/v4/competitions/CL/scorers",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => res.send(result))
    .catch((error) => res.send("error", error));
});

app.get("/api/standings", (req, res) => {
  fetch(
    "http://api.football-data.org/v4/competitions/CL/standings",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => res.send(result))
    .catch((error) => res.send("error", error));
});

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running ✅" });
});
