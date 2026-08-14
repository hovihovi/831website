#!/usr/bin/env node
/* ============================================================
   LE 831 — 火焱山 · serveur Node (module http natif, zéro dépendance)
   - Sert les fichiers statiques du site
   - API : GET /api/menu, POST /api/menu (auth token), GET /api/health
   - Persistance atomique dans data/menu.json
   ============================================================ */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const ROOT = __dirname;
const MENU_PATH = path.join(ROOT, "data", "menu.json");
const DATA_DIR = path.dirname(MENU_PATH);

const DEV_TOKEN = "le831admin";
const ADMIN_TOKEN = process.env.LE831_ADMIN_TOKEN || DEV_TOKEN;

if (!process.env.LE831_ADMIN_TOKEN) {
  console.warn("[le831] ⚠ LE831_ADMIN_TOKEN non défini — utilisation du token de DEV « " + DEV_TOKEN + " ».");
}

const ALLOWED_TAGS = ["spicy", "veggie", "signature"];

// Liste fermée des allergènes (codes EU INCO). L'ordre définit l'ordre d'affichage.
const ALLOWED_ALLERGENS = [
  "gluten", "crustaces", "oeufs", "poisson", "arachides", "soja", "lait",
  "fruitscoque", "celeri", "moutarde", "sesame", "sulfites", "mollusques", "lupin"
];

// Tailles standard proposées par l'admin (labels trilingues fixes).
const SIZE_PRESETS = [
  { fr: "Petite", en: "Small", cn: "小份" },
  { fr: "Moyenne", en: "Medium", cn: "中份" },
  { fr: "Grande", en: "Large", cn: "大份" }
];

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

/* ---------- Validation du schéma ---------- */
function isValidPrice(s) {
  // Accepte "5,50 €", "5.5", "7", "14,00 €", "3,50"…
  return typeof s === "string" && /^\s*\d+(?:[.,]\d{1,2})?\s*(?:€|EUR)?\s*$/i.test(s);
}

function isValidSize(sz) {
  if (sz === null || sz === undefined) return true; // taille vide autorisée (prix unique)
  return !!sz && typeof sz === "object" && !Array.isArray(sz) &&
    typeof sz.fr === "string" && typeof sz.en === "string" && typeof sz.cn === "string";
}

function sizeKey(sz) {
  if (!sz) return "__null__";
  return sz.fr + "\u0001" + sz.en + "\u0001" + sz.cn;
}

function validatePrices(it, where) {
  if (Array.isArray(it.prices)) {
    if (it.prices.length < 1 || it.prices.length > 3) {
      return where + " : « prices » doit contenir entre 1 et 3 entrées.";
    }
    const seen = new Set();
    for (let k = 0; k < it.prices.length; k++) {
      const p = it.prices[k];
      if (!p || typeof p !== "object" || Array.isArray(p)) {
        return where + " : entrée de prix #" + (k + 1) + " invalide.";
      }
      if (!isValidPrice(p.price)) {
        return where + " : prix #" + (k + 1) + " manquant ou invalide.";
      }
      if (!isValidSize(p.size)) {
        return where + " : taille #" + (k + 1) + " invalide (fr/en/cn requis, ou null).";
      }
      if (it.prices.length > 1 && p.size == null) {
        return where + " : la taille ne peut être vide que pour un prix unique.";
      }
      const key = sizeKey(p.size || null);
      if (seen.has(key)) return where + " : tailles en double.";
      seen.add(key);
    }
    return null;
  }
  // Rétrocompat : ancien champ « price » (string) → migré en prix unique sans taille.
  if (typeof it.price === "string") {
    if (!isValidPrice(it.price)) return where + " : prix manquant ou invalide.";
    return null;
  }
  return where + " : champ « prices » manquant (ou ancien « price » absent).";
}

function validateMenu(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "Objet JSON attendu.";
  if (data.categories === undefined || !Array.isArray(data.categories)) {
    return "Champ « categories » manquant ou non-tableau.";
  }
  for (let i = 0; i < data.categories.length; i++) {
    const c = data.categories[i];
    if (!c || typeof c !== "object" || Array.isArray(c)) return "Catégorie #" + (i + 1) + " : objet attendu.";
    if (typeof c.id !== "string" || !c.id) return "Catégorie #" + (i + 1) + " : identifiant (id) manquant.";
    if (!c.label || typeof c.label.fr !== "string" || typeof c.label.en !== "string" || typeof c.label.cn !== "string") {
      return "Catégorie « " + c.id + " » : libellés FR/EN/CN requis.";
    }
    if (!Array.isArray(c.items)) return "Catégorie « " + c.id + " » : champ « items » manquant.";
    for (let j = 0; j < c.items.length; j++) {
      const it = c.items[j];
      if (!it || typeof it !== "object" || Array.isArray(it)) return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : objet attendu.";
      if (!it.name || typeof it.name.fr !== "string" || typeof it.name.en !== "string" || typeof it.name.cn !== "string") {
        return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : nom FR/EN/CN requis.";
      }
      if (!it.desc || typeof it.desc.fr !== "string" || typeof it.desc.en !== "string" || typeof it.desc.cn !== "string") {
        return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : description FR/EN/CN requise.";
      }
      const priceErr = validatePrices(it, "Catégorie « " + c.id + " », plat #" + (j + 1) + "");
      if (priceErr) return priceErr;
      if (it.allergens !== undefined) {
        if (!Array.isArray(it.allergens)) {
          return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : « allergens » doit être un tableau.";
        }
        for (const a of it.allergens) {
          if (ALLOWED_ALLERGENS.indexOf(a) === -1) {
            return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : allergène « " + a + " » inconnu.";
          }
        }
      }
      if (it.tags !== undefined) {
        if (!Array.isArray(it.tags)) return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : « tags » doit être un tableau.";
        for (const t of it.tags) {
          if (ALLOWED_TAGS.indexOf(t) === -1) return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : tag « " + t + " » non autorisé.";
        }
      }
      if (it.photo !== undefined && it.photo !== null) {
        if (typeof it.photo !== "object" || Array.isArray(it.photo) || typeof it.photo.src !== "string" || !it.photo.src) {
          return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : photo.src manquant.";
        }
        if (it.photo.alt !== undefined && it.photo.alt !== null) {
          if (typeof it.photo.alt !== "object" || typeof it.photo.alt.fr !== "string" || typeof it.photo.alt.en !== "string" || typeof it.photo.alt.cn !== "string") {
            return "Catégorie « " + c.id + " », plat #" + (j + 1) + " : photo.alt FR/EN/CN requis.";
          }
        }
      }
    }
  }
  return null;
}

/* ---------- Migration / normalisation v4 ---------- */
/* Convertit l'ancien champ « price » en « prices », ajoute « allergens » si absent,
   et supprime le champ legacy. Renvoie le même objet (muté).
   NB : les clés « ar » (nom/description/libellé/taille/allergènes) sont optionnelles
   et sont conservées telles quelles. */
function normalizeMenu(data) {
  (data.categories || []).forEach((c) => {
    (c.items || []).forEach((it) => {
      if (!Array.isArray(it.prices)) {
        it.prices = (typeof it.price === "string")
          ? [{ size: null, price: it.price }]
          : [];
      }
      delete it.price;
      if (!Array.isArray(it.allergens)) it.allergens = [];
    });
  });
  return data;
}

/* ---------- Écriture atomique ---------- */
function atomicWrite(filePath, content) {
  const tmp = filePath + ".tmp-" + process.pid + "-" + Date.now();
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
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

/* ---------- Routage API ---------- */
function handleApi(req, res, url) {
  const pathname = url.pathname;

  if (pathname === "/api/health") {
    sendJSON(res, 200, { ok: true }, { "Cache-Control": "no-store" });
    return true;
  }

  if (pathname === "/api/menu") {
    if (req.method === "GET") {
      fs.readFile(MENU_PATH, (err, buf) => {
        if (err) {
          sendJSON(res, 500, { error: "Impossible de lire data/menu.json" });
          return;
        }
        let data;
        try {
          data = JSON.parse(buf.toString("utf8"));
          normalizeMenu(data); // garantit le format v4 même si le fichier est encore en v2/v3
        } catch (e) {
          sendJSON(res, 500, { error: "data/menu.json invalide : " + e.message });
          return;
        }
        sendJSON(res, 200, data, { "Cache-Control": "no-store" });
      });
      return true;
    }

    if (req.method === "POST") {
      const provided = req.headers["x-admin-token"];
      if (!provided || !safeEqual(provided, ADMIN_TOKEN)) {
        sendJSON(res, 401, { error: "Token administrateur manquant ou invalide." });
        return true;
      }
      readBody(req).then((buf) => {
        let data;
        try {
          data = JSON.parse(buf.toString("utf8") || "{}");
        } catch (e) {
          sendJSON(res, 400, { error: "JSON invalide : " + e.message });
          return;
        }
        const err = validateMenu(data);
        if (err) {
          sendJSON(res, 400, { error: err });
          return;
        }
        normalizeMenu(data); // migre l'ancien « price » et ajoute « allergens » si besoin
        data.version = 4;
        data.updatedAt = new Date().toISOString();
        try {
          if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
          atomicWrite(MENU_PATH, JSON.stringify(data, null, 2) + "\n");
        } catch (e) {
          console.error("[le831] Erreur d'écriture menu.json :", e.message);
          sendJSON(res, 500, { error: "Échec de l'écriture du menu : " + e.message });
          return;
        }
        console.log("[le831] Menu mis à jour (" + data.categories.length + " catégories)");
        sendJSON(res, 200, data);
      }).catch((e) => {
        if (e && e.message === "body_too_large") sendJSON(res, 413, { error: "Corps trop volumineux." });
        else sendJSON(res, 400, { error: "Erreur de lecture du corps." });
      });
      return true;
    }

    sendJSON(res, 405, { error: "Méthode non autorisée." });
    return true;
  }

  return false;
}

/* ---------- Servir les fichiers statiques ---------- */
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

/* ---------- Serveur ---------- */
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));
  console.log(req.method + " " + url.pathname);

  if (url.pathname.startsWith("/api/")) {
    if (handleApi(req, res, url)) return;
    sendJSON(res, 404, { error: "API introuvable." });
    return;
  }

  serveStatic(req, res, url);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("[le831] Le port " + PORT + " est déjà utilisé. Arrêtez l'autre processus (ex. python3 -m http.server) puis relancez.");
  } else {
    console.error("[le831] Erreur serveur :", err.message);
  }
  process.exit(1);
});

function shutdown() {
  console.log("\n[le831] Arrêt du serveur…");
  server.close(() => {
    console.log("[le831] Serveur arrêté.");
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

server.listen(PORT, HOST, () => {
  console.log("[le831] Serveur démarré sur http://" + HOST + ":" + PORT);
  console.log("[le831] API : /api/menu (GET/POST), /api/health (GET)");
});
