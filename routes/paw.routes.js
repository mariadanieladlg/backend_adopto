// routes/paw.routes.js
const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Paw = require("../models/Paw.model");

// Ensure /uploads exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => {
    const safe = (file.originalname || "file")
      .replace(/\s+/g, "_")
      .toLowerCase();
    const unique = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(null, unique + "_" + safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
});

// Helpers
const norm = (v) => (v ?? "").toString().trim();
const lower = (v) => norm(v).toLowerCase();

function buildQuery({ q, city, species, status }) {
  const f = {};
  if (species) f.species = lower(species);
  if (status) f.status = lower(status);
  if (city) f.city = lower(city);
  if (q) {
    const rx = new RegExp(norm(q).replace(/\s+/g, ".*"), "i");
    f.$or = [{ title: rx }, { description: rx }, { city: rx }];
  }
  return f;
}

// GET /paw
router.get("/", async (req, res) => {
  try {
    const { q, city, species, status, page = 1, limit = 20 } = req.query;
    const filter = buildQuery({ q, city, species, status });
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Paw.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Paw.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("GET /paw error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// POST /paw  (multipart/form-data, field: image)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Log para depurar rápido
    console.log("REQ BODY:", req.body);
    console.log(
      "REQ FILE:",
      req.file && {
        fieldname: req.file.fieldname,
        filename: req.file.filename,
        size: req.file.size,
      }
    );

    const payload = {
      status: lower(req.body.status),
      species: lower(req.body.species),
      title: norm(req.body.title),
      description: norm(req.body.description),
      city: lower(req.body.city),
      country: norm(req.body.country) || "netherlands",
      contact_name: norm(req.body.contact_name),
      contact_phone: norm(req.body.contact_phone),
      contact_email: lower(req.body.contact_email),
      image_url: req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : "",
    };

    // Validations
    if (!payload.status || !["lost", "found"].includes(payload.status)) {
      return res.status(400).json({
        error: "Invalid or missing 'status' (expected: lost | found)",
      });
    }
    if (!payload.species || !["dog", "cat"].includes(payload.species)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing 'species' (expected: dog | cat)" });
    }
    if (!payload.title || !payload.description || !payload.city) {
      return res.status(400).json({
        error: "Fields 'title', 'description' and 'city' are required",
      });
    }

    const doc = await Paw.create(payload);
    res.status(201).json(doc);
  } catch (err) {
    console.error("POST /paw error:", err);
    res.status(400).json({ error: err?.message || "Failed to create post" });
  }
});

module.exports = router;
