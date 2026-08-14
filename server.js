#!/usr/bin/env node
/* ============================================================
   LE 831 — 火焱山 · hôte Node (module http natif, zéro dépendance)
   - Sert les fichiers statiques du site
   - Services communs : TLS, login (POST /api/login), GET /api/health,
     redirection admin HTTP→HTTPS
   - Chargeur de modules : lit modules.json, monte les routes API et
     les assets de chaque lib versionnée (libs/<name>/<version>/)
   ============================================================ */
"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const TLS_CERT = process.env.LE831_TLS_CERT;
const TLS_KEY = process.env.LE831_TLS_KEY;
const TLS_PORT = Number(process.env.LE831_TLS_PORT) || 8444;
const TLS_PUBLIC_PORT = Number(process.env.LE831_TLS_PUBLIC_PORT) || 443;
let tlsActive = false;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const MENU_PATH = path.join(DATA_DIR, "menu.json");
const MODULES_PATH = path.join(ROOT, "modules.json");
const LIBS_DIR = path.join(ROOT, "libs");

const DEV_TOKEN = "le831admin";
const ADMIN_TOKEN = process.env.LE831_ADMIN_TOKEN || DEV_TOKEN;

const ADMIN_USER = process.env.LE831_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.LE831_ADMIN_PASS || "le831admin";

if (!process.env.LE831_ADMIN_TOKEN) {
  console.warn("[le831] ⚠ LE831_ADMIN_TOKEN non défini — utilisation du token de DEV « " + DEV_TOKEN + " ».");
}

const MAX_BODY = 25 * 1024 * 1024; // 25 Mo (photos en data URI)

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

/* ---------- Auth ---------- */
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  const len = Math.max(ab.length, bb.length);
  const ap = Buffer.alloc(len, 0);
  const bp = Buffer.alloc(len, 0);
  ab.copy(ap);
  bb.copy(bp);
  return crypto.timingSafeEqual(ap, bp);
}

/* ---------- Écriture atomique ---------- */
function atomicWrite(filePath, content) {
  const tmp = filePath + ".tmp-" + process.pid + "-" + Date.now();
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}

/* ---------- Stockage du menu (fourni au module via ctx) ---------- */
function readMenu() {
  try {
    return JSON.parse(fs.readFileSync(MENU_PATH, "utf8"));
  } catch (e) {
    return null;
  }
}

function writeMenu(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  atomicWrite(MENU_PATH, JSON.stringify(data, null, 2) + "\n");
}

/* ---------- Réponse HTTP ---------- */
function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({
    "X-Content-Type-Options": "nosniff"
  }, headers || {}));
  res.end(body);
}

function sendJSON(res, status, obj, extraHeaders) {
  const body = JSON.stringify(obj);
  send(res, status, body, Object.assign({ "Content-Type": "application/json; charset=utf-8" }, extraHeaders || {}));
}

/* ---------- Lecture du body ---------- */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("body_too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/* ---------- Contexte partagé avec les modules ---------- */
const ctx = {
  storagePath: DATA_DIR,
  readMenu: readMenu,
  writeMenu: writeMenu,
  adminToken: ADMIN_TOKEN,
  safeEqual: safeEqual,
  send: send,
  sendJSON: sendJSON,
  readBody: readBody
};

/* ---------- Loader de modules ---------- */
const apiRoutes = {};   // pathname -> { METHOD: handler }
const assetRoutes = {}; // pathname -> chemin absolu du fichier

function loadModules() {
  let modules;
  try {
    modules = JSON.parse(fs.readFileSync(MODULES_PATH, "utf8"));
  } catch (e) {
    console.error("[le831] Impossible de lire modules.json :", e.message);
    process.exit(1);
  }

  for (const name of Object.keys(modules)) {
    const version = modules[name];
    const libDir = path.join(LIBS_DIR, name, version);
    const manifestPath = path.join(libDir, "manifest.json");
    const serverPath = path.join(libDir, "server.js");

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (e) {
      console.error("[le831] Impossible de charger " + manifestPath + " :", e.message);
      process.exit(1);
    }

    let lib;
    try {
      lib = require(serverPath);
    } catch (e) {
      console.error("[le831] Impossible de charger " + serverPath + " :", e.message);
      process.exit(1);
    }

    if (lib && lib.routes && typeof lib.routes === "object") {
      for (const routePath of Object.keys(lib.routes)) {
        apiRoutes[routePath] = lib.routes[routePath];
      }
    }

    if (manifest.assets && Array.isArray(manifest.assets)) {
      for (const asset of manifest.assets) {
        const rel = String(asset).replace(/^\/+/, "");
        const filePath = path.join(libDir, rel);
        assetRoutes[String(asset)] = filePath;                                   // alias propre (/admin.html)
        assetRoutes["/libs/" + name + "/" + version + "/" + rel] = filePath;     // chemin complet versionné
      }
    }

    if (lib && typeof lib.init === "function") {
      lib.init(ctx);
    }

    console.log("[le831] Module « " + name + " » v" + version + " chargé.");
  }
}

/* ---------- Routage API (services communs + modules) ---------- */
function handleApi(req, res, url) {
  const pathname = url.pathname;

  if (pathname === "/api/health") {
    sendJSON(res, 200, { ok: true }, { "Cache-Control": "no-store" });
    return true;
  }

  if (pathname === "/api/login") {
    if (req.method !== "POST") {
      sendJSON(res, 405, { error: "Méthode non autorisée." });
      return true;
    }
    readBody(req).then((buf) => {
      let body = {};
      try {
        body = JSON.parse(buf.toString("utf8") || "{}");
      } catch (e) {
        sendJSON(res, 401, { error: "Identifiants invalides." });
        return;
      }
      const username = typeof body.username === "string" ? body.username : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (username !== ADMIN_USER || !safeEqual(password, ADMIN_PASS)) {
        sendJSON(res, 401, { error: "Identifiants invalides." });
        return;
      }
      sendJSON(res, 200, { token: ADMIN_TOKEN }, { "Cache-Control": "no-store" });
    }).catch(() => {
      sendJSON(res, 400, { error: "Erreur de lecture du corps." });
    });
    return true;
  }

  const route = apiRoutes[pathname];
  if (route) {
    const handler = route[req.method];
    if (typeof handler === "function") {
      handler(req, res, ctx);
    } else {
      sendJSON(res, 405, { error: "Méthode non autorisée." });
    }
    return true;
  }

  return false;
}

/* ---------- Servir un fichier ---------- */
function serveFile(filePath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      send(res, 404, "404 — Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": stats.size,
      "X-Content-Type-Options": "nosniff"
    });
    const stream = fs.createReadStream(filePath);
    stream.on("error", () => {
      res.destroy();
    });
    stream.pipe(res);
  });
}

/* ---------- Servir les fichiers statiques du site ---------- */
function serveStatic(req, res, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch (e) {
    send(res, 400, "Bad Request");
    return;
  }

  if (pathname === "/") pathname = "/index.html";

  const filePath = path.resolve(ROOT, "." + pathname);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    send(res, 403, "Forbidden");
    return;
  }

  const base = path.basename(filePath);
  if (base === "server.js" || base.indexOf(".tmp-") !== -1) {
    send(res, 404, "404 — Not Found");
    return;
  }

  serveFile(filePath, res);
}

/* ---------- Handler de requêtes (partagé HTTP + HTTPS) ---------- */
function handleRequest(req, res) {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  console.log(req.method + " " + url.pathname);

  // Redirection de l'interface d'admin vers HTTPS (uniquement si TLS actif
  // et uniquement pour les requêtes HTTP — pas de boucle sur le serveur TLS).
  if (tlsActive && !req.socket.encrypted && url.pathname === "/admin.html") {
    const host = url.hostname || "localhost";
    const suffix = TLS_PUBLIC_PORT === 443 ? "" : ":" + TLS_PUBLIC_PORT;
    res.writeHead(301, {
      "Location": "https://" + host + suffix + "/admin.html"
    });
    res.end();
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    if (handleApi(req, res, url)) return;
    sendJSON(res, 404, { error: "API introuvable." });
    return;
  }

  // Assets servis par les modules (alias + chemin versionné).
  if (assetRoutes[url.pathname]) {
    serveFile(assetRoutes[url.pathname], res);
    return;
  }

  serveStatic(req, res, url);
}

/* ---------- Serveur ---------- */
const server = http.createServer(handleRequest);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("[le831] Le port " + PORT + " est déjà utilisé. Arrêtez l'autre processus (ex. python3 -m http.server) puis relancez.");
  } else {
    console.error("[le831] Erreur serveur :", err.message);
  }
  process.exit(1);
});

/* ---------- Serveur HTTPS (optionnel) ---------- */
let tlsServer = null;

function setupTLS() {
  if (!TLS_CERT || !TLS_KEY) {
    console.warn("[le831] HTTPS désactivé (LE831_TLS_CERT / LE831_TLS_KEY non définis).");
    return;
  }
  let cert, key;
  try {
    cert = fs.readFileSync(TLS_CERT);
    key = fs.readFileSync(TLS_KEY);
  } catch (e) {
    console.warn("[le831] Impossible de lire les certificats TLS (" + e.message + ") — HTTPS désactivé, HTTP seul.");
    return;
  }
  tlsServer = https.createServer({ cert, key }, handleRequest);
  tlsServer.on("error", (err) => {
    console.error("[le831] Erreur serveur HTTPS :", err.message);
  });
  tlsServer.listen(TLS_PORT, HOST, () => {
    tlsActive = true;
    console.log("[le831] HTTPS démarré sur https://" + HOST + ":" + TLS_PORT);
  });
}

function shutdown() {
  console.log("\n[le831] Arrêt du serveur…");
  let pending = 1;
  const done = () => {
    pending--;
    if (pending <= 0) {
      console.log("[le831] Serveur arrêté.");
      process.exit(0);
    }
  };
  server.close(done);
  if (tlsServer) tlsServer.close(done);
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

loadModules();

server.listen(PORT, HOST, () => {
  console.log("[le831] Serveur démarré sur http://" + HOST + ":" + PORT);
  console.log("[le831] API : /api/menu (GET/POST), /api/login (POST), /api/health (GET)");
});

setupTLS();
