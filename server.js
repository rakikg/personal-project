const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend (HTML, CSS, JS)
app.use(express.static(__dirname));

// ================= DATABASE =================
const db = mysql.createPool({
  uri: "mysql://root:GKbHbmyPgeuVmFeXAtDOCbnGDzvwzotG@crossover.proxy.rlwy.net:26417/railway",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test DB
db.getConnection((err, connection) => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");

  // Create tables
  connection.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id BIGINT PRIMARY KEY,
      title VARCHAR(255),
      tech VARCHAR(255),
      description TEXT
    )
  `);

  connection.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  connection.release();
});

// ================= ROUTES =================

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Projects
app.get("/projects", (req, res) => {
  db.query("SELECT * FROM projects ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ error: "Fetch failed" });
    res.json(result);
  });
});

app.post("/projects", (req, res) => {
  const { title, tech, description } = req.body;
  const id = Date.now();

  db.query(
    "INSERT INTO projects VALUES (?, ?, ?, ?)",
    [id, title, tech, description],
    (err) => {
      if (err) return res.status(500).json({ error: "Insert failed" });
      res.json({ id, title, tech, description });
    }
  );
});

app.delete("/projects/:id", (req, res) => {
  db.query("DELETE FROM projects WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    res.json({ message: "Deleted" });
  });
});

// Contact
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  const id = Date.now();

  db.query(
    "INSERT INTO contacts (id, name, email, message) VALUES (?, ?, ?, ?)",
    [id, name, email, message],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ message: "Saved successfully" });
    }
  );
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});