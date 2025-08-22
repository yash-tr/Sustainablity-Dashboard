// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
// optional: serve static files (if you want)
app.use(express.static(path.join(__dirname, "public")));

// Simple endpoint returning the JSON stored in public/data/mockData.json
app.get("/api/sustainability", (req, res) => {
  const file = path.join(__dirname, "public", "data", "mockData.json");
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8");
    try {
      const json = JSON.parse(raw);
      return res.json(json);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON file" });
    }
  }
  return res.status(404).json({
    error: "mockData.json not found. Create public/data/mockData.json",
  });
});

app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});
