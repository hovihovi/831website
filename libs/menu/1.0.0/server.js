/* ============================================================
   LE 831 — module « menu » v1.0.0
   Gestion du menu : GET/POST /api/menu, validation, stockage.
   Indépendant du site hôte : il travaille uniquement via le ctx
   fourni par l'hôte (storagePath, readMenu, writeMenu, adminToken,
   safeEqual, helpers HTTP…). Zéro dépendance.
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");

const SEED_PATH = path.join(__dirname, "seed", "menu.default.json");

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

/* ---------- Écriture atomique (pour le seed) ---------- */
function atomicWrite(filePath, content) {
  const tmp = filePath + ".tmp-" + process.pid + "-" + Date.now();
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
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

/* ---------- Seed ---------- */
function readSeed() {
  try {
    const buf = fs.readFileSync(SEED_PATH, "utf8");
    const data = JSON.parse(buf);
    normalizeMenu(data);
    return data;
  } catch (e) {
    return null;
  }
}

/* ---------- Initialisation du stockage local ---------- */
/* Si data/menu.json (état runtime local par instance) n'existe pas, on le crée
   en copiant le seed commité de la lib. Chaque instance (DEV = workspace,
   PRD = clone) démarre avec son propre menu persistant, jamais écrasé par un git pull. */
function ensureLocalMenu(ctx) {
  const menuPath = path.join(ctx.storagePath, "menu.json");
  if (fs.existsSync(menuPath)) return;
  try {
    if (!fs.existsSync(ctx.storagePath)) fs.mkdirSync(ctx.storagePath, { recursive: true });
    const seed = fs.readFileSync(SEED_PATH, "utf8");
    atomicWrite(menuPath, seed);
    console.log("[menu] data/menu.json absent — copie du seed libs/menu/1.0.0/seed/menu.default.json créée.");
  } catch (e) {
    console.error("[menu] Impossible d'initialiser data/menu.json depuis le seed :", e.message);
  }
}

/* ---------- Handlers ---------- */
function getMenu(req, res, ctx) {
  let data = ctx.readMenu();
  if (!data) {
    // Fallback : menu local absent/corrompu → on sert le seed commité.
    data = readSeed();
    if (!data) {
      ctx.sendJSON(res, 500, { error: "Impossible de lire data/menu.json" });
      return;
    }
  }
  normalizeMenu(data); // garantit le format v4 même si le fichier est encore en v2/v3
  ctx.sendJSON(res, 200, data, { "Cache-Control": "no-store" });
}

function postMenu(req, res, ctx) {
  const provided = req.headers["x-admin-token"];
  if (!provided || !ctx.safeEqual(provided, ctx.adminToken)) {
    ctx.sendJSON(res, 401, { error: "Token administrateur manquant ou invalide." });
    return;
  }
  ctx.readBody(req).then((buf) => {
    let data;
    try {
      data = JSON.parse(buf.toString("utf8") || "{}");
    } catch (e) {
      ctx.sendJSON(res, 400, { error: "JSON invalide : " + e.message });
      return;
    }
    const err = validateMenu(data);
    if (err) {
      ctx.sendJSON(res, 400, { error: err });
      return;
    }
    normalizeMenu(data); // migre l'ancien « price » et ajoute « allergens » si besoin
    data.version = 4;
    data.updatedAt = new Date().toISOString();
    try {
      ctx.writeMenu(data);
    } catch (e) {
      console.error("[menu] Erreur d'écriture menu.json :", e.message);
      ctx.sendJSON(res, 500, { error: "Échec de l'écriture du menu : " + e.message });
      return;
    }
    console.log("[menu] Menu mis à jour (" + data.categories.length + " catégories)");
    ctx.sendJSON(res, 200, data);
  }).catch((e) => {
    if (e && e.message === "body_too_large") ctx.sendJSON(res, 413, { error: "Corps trop volumineux." });
    else ctx.sendJSON(res, 400, { error: "Erreur de lecture du corps." });
  });
}

/* ---------- Contrat de module ---------- */
module.exports = {
  routes: {
    "/api/menu": { GET: getMenu, POST: postMenu }
  },
  init: ensureLocalMenu
};
