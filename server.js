const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(__dirname));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// ================= DATABASE =================

// ⚠️ Hardcoded (OK for learning only)
const db = mysql.createPool({
  uri: "mysql://root:GKbHbmyPgeuVmFeXAtDOCbnGDzvwzotG@crossover.proxy.rlwy.net:26417/railway",
  waitForConnections: true,
  connectionLimit: 10,
});

// Test connection + create tables
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
    return;
  }

  console.log("✅ Connected to MySQL database");

  // Create projects table
  const createProjectsTable = `
    CREATE TABLE IF NOT EXISTS projects (
      id BIGINT PRIMARY KEY,
      title VARCHAR(255),
      tech VARCHAR(255),
      description TEXT
    )
  `;

  connection.query(createProjectsTable, (err) => {
    if (err) console.error("❌ Projects table error:", err);
    else console.log("✅ Projects table ready");
  });

  // Create contacts table
  const createContactsTable = `
    CREATE TABLE IF NOT EXISTS contacts (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  connection.query(createContactsTable, (err) => {
    if (err) console.error("❌ Contacts table error:", err);
    else console.log("✅ Contacts table ready");
  });

  connection.release();
});


// ================= ROUTES =================

// ===== PROJECTS CRUD =====

// CREATE
app.post('/projects', (req, res) => {
  const { title, tech, description } = req.body;
  const id = Date.now();

  const sql = `
    INSERT INTO projects (id, title, tech, description)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [id, title, tech, description], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Insert failed" });
    }
    res.json({ id, title, tech, description });
  });
});


// READ
app.get('/projects', (req, res) => {
  const sql = `SELECT * FROM projects ORDER BY id DESC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Fetch failed" });
    }
    res.json(result);
  });
});


// UPDATE
app.put('/projects/:id', (req, res) => {
  const id = req.params.id;
  const { title, tech, description } = req.body;

  const sql = `
    UPDATE projects
    SET title = ?, tech = ?, description = ?
    WHERE id = ?
  `;

  db.query(sql, [title, tech, description, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Update failed" });
    }
    res.json({ message: "Updated successfully" });
  });
});


// DELETE
app.delete('/projects/:id', (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM projects WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Delete failed" });
    }
    res.json({ message: "Deleted successfully" });
  });
});


// ===== CONTACT =====

// CREATE
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  const id = Date.now();

  const sql = `
    INSERT INTO contacts (id, name, email, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [id, name, email, message], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Message saved successfully!" });
  });
});


// READ CONTACTS (optional)
app.get('/contact', (req, res) => {
  const sql = `SELECT * FROM contacts ORDER BY created_at DESC`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Fetch failed" });
    }
    res.json(result);
  });
});


// ================= SERVER =================

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});