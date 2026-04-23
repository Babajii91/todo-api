const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "tasksdb",
  port: process.env.DB_PORT || 5432
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM tasks ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    await pool.query("INSERT INTO tasks(name) VALUES($1)", [name]);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API running on port ${port}`));

module.exports = app;
