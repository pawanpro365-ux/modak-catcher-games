/**
 * Modak Catcher - Local Server
 * Zero-dependency Node.js HTTP server for static files & leaderboard API.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "leaderboard.json");

// Default initial records with NIAT ID & Campus
const DEFAULT_LEADERBOARD = [
  { name: "Bal Ganesha", niatId: "NIAT-DEV-001", campus: "NIAT Main Campus", score: 45, level: 5, date: "Festival Day" },
  { name: "Aarav Sharma", niatId: "NIAT-GN-2024", campus: "NIAT Greater Noida", score: 38, level: 4, date: "Sep 12" },
  { name: "Mooshak", niatId: "NIAT-DEL-108", campus: "NIAT Delhi NCR", score: 28, level: 3, date: "Shukla Chaturthi" },
  { name: "Priya Singh", niatId: "NIAT-PUN-042", campus: "NIAT Pune", score: 22, level: 3, date: "Sep 11" },
  { name: "Devotee", niatId: "NIAT-BLR-019", campus: "NIAT Bangalore", score: 14, level: 2, date: "Sep 10" }
];

// Helper to load leaderboard from file
function readLeaderboard() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_LEADERBOARD, null, 2), "utf8");
      return DEFAULT_LEADERBOARD;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return DEFAULT_LEADERBOARD;
    return data;
  } catch (err) {
    console.error("Error reading leaderboard file:", err);
    return DEFAULT_LEADERBOARD;
  }
}

// Helper to save leaderboard to file
function writeLeaderboard(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing leaderboard file:", err);
    return false;
  }
}

// MIME types dictionary
const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml"
};

// Handle CORS Headers
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Create Server
const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  // Handle pre-flight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // ----------------------------------------------------------------
  // REST API: /api/leaderboard
  // ----------------------------------------------------------------
  if (pathname === "/api/leaderboard") {
    // GET: Retrieve all leaderboard entries
    if (req.method === "GET") {
      const records = readLeaderboard();
      res.writeHead(200, { "Content-Type": "application/json; charset=UTF-8" });
      res.end(JSON.stringify(records));
      return;
    }

    // POST: Add new score entry
    if (req.method === "POST") {
      let body = "";
      req.on("data", chunk => { body += chunk; });
      req.on("end", () => {
        try {
          const entry = JSON.parse(body);
          if (!entry.name || typeof entry.score !== "number") {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid payload: name and numeric score required" }));
            return;
          }

          const records = readLeaderboard();
          const today = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" });
          
          const newRecord = {
            name: String(entry.name).trim().slice(0, 24),
            niatId: entry.niatId ? String(entry.niatId).trim().slice(0, 24) : "NIAT-GUEST",
            campus: entry.campus ? String(entry.campus).trim().slice(0, 30) : "NIAT Main Campus",
            score: Math.max(0, parseInt(entry.score, 10) || 0),
            level: Math.max(1, parseInt(entry.level, 10) || 1),
            date: entry.date || today
          };

          records.push(newRecord);
          // Sort descending by score
          records.sort((a, b) => b.score - a.score);

          writeLeaderboard(records);

          res.writeHead(201, { "Content-Type": "application/json; charset=UTF-8" });
          res.end(JSON.stringify({ success: true, record: newRecord, leaderboard: records }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Malformed JSON" }));
        }
      });
      return;
    }

    // DELETE: Clear records
    if (req.method === "DELETE") {
      writeLeaderboard([]);
      res.writeHead(200, { "Content-Type": "application/json; charset=UTF-8" });
      res.end(JSON.stringify({ success: true, message: "Leaderboard cleared" }));
      return;
    }

    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  // ----------------------------------------------------------------
  // Static File Serving
  // ----------------------------------------------------------------
  let filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);

  // Security: Prevent directory traversal
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(__dirname)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🪔 Modak Catcher Server is live!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📁 Data File: ${DATA_FILE}`);
  console.log(`====================================================`);
});
