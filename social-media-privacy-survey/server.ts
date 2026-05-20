import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure data directory exists
  if (!fs.existsSync(path.join(process.cwd(), "data"))) {
    fs.mkdirSync(path.join(process.cwd(), "data"));
  }

  // Database setup
  const db = await open({
    filename: path.join(process.cwd(), "data", "survey.db"),
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      age TEXT,
      site TEXT,
      site_other TEXT,
      frequency TEXT,
      q_concerns_1 INTEGER,
      q_concerns_2 INTEGER,
      q_concerns_3 INTEGER,
      q_concerns_4 INTEGER,
      q_concerns_5 INTEGER,
      q_concerns_6 INTEGER,
      q_concerns_7 INTEGER,
      q_concerns_8 INTEGER,
      q_behaviors_1 INTEGER,
      q_behaviors_2 INTEGER,
      q_behaviors_3 INTEGER,
      q_behaviors_4 INTEGER,
      q_behaviors_5 INTEGER,
      score_concerns INTEGER,
      score_behaviors INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  app.post("/api/survey", async (req, res) => {
    const data = req.body;
    try {
      const result = await db.run(
        `INSERT INTO responses (
          age, site, site_other, frequency,
          q_concerns_1, q_concerns_2, q_concerns_3, q_concerns_4, 
          q_concerns_5, q_concerns_6, q_concerns_7, q_concerns_8,
          q_behaviors_1, q_behaviors_2, q_behaviors_3, q_behaviors_4, q_behaviors_5,
          score_concerns, score_behaviors
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?, ?, 
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?
        )`,
        [
          data.age, data.site, data.siteOther, data.frequency,
          data.qConcerns[0], data.qConcerns[1], data.qConcerns[2], data.qConcerns[3],
          data.qConcerns[4], data.qConcerns[5], data.qConcerns[6], data.qConcerns[7],
          data.qBehaviors[0], data.qBehaviors[1], data.qBehaviors[2], data.qBehaviors[3], data.qBehaviors[4],
          data.scoreConcerns, data.scoreBehaviors
        ]
      );
      res.json({ success: true, id: result.lastID });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to save survey" });
    }
  });

  app.get("/api/results", async (req, res) => {
    try {
      const results = await db.all(`SELECT * FROM responses ORDER BY created_at DESC`);
      res.json(results);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
