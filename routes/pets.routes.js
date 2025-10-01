// routes/pets.routes.js
const router = require("express").Router();
const mongoose = require("mongoose");
const Pet = require("../models/Pet.model");
// --- helpers ---
function buildIdFilter(idParam) {
  if (mongoose.Types.ObjectId.isValid(idParam)) return { _id: idParam };
  if (!isNaN(Number(idParam))) return { id: Number(idParam) };
  return null;
}
const toBool = (v) =>
  v === true ||
  v === "true" ||
  v === "1" ||
  v === 1 ||
  v === "on" ||
  v === "yes";
const toNum = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  if (typeof v === "string") v = v.replace(",", ".");
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const toArray = (v) => {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string")
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  return undefined;
};
// --- GET /pets (lista con filtros, devuelve array) ---
router.get("/", async (req, res) => {
  try {
    const {
      species,
      life_stage,
      sex,
      city,
      country,
      q,
      good_with_dogs,
      good_with_cats,
      good_with_kids,
      house_trained,
      microchipped,
      spayed_neutered,
      dewormed,
      min_age,
      max_age,
      min_energy,
      max_energy,
      limit,
      skip,
      sort = "-createdAt",
    } = req.query;
    const filter = {};
    // enums simples
    if (species) filter.species = species;
    if (life_stage) filter.life_stage = life_stage;
    if (sex) filter.sex = sex;
    // ubicación
    if (city) filter.location_city = city;
    if (country) filter.location_country = country;
    // booleans
    [
      ["good_with_dogs", good_with_dogs],
      ["good_with_cats", good_with_cats],
      ["good_with_kids", good_with_kids],
      ["house_trained", house_trained],
      ["microchipped", microchipped],
      ["spayed_neutered", spayed_neutered],
      ["dewormed", dewormed],
    ].forEach(([key, val]) => {
      if (val !== undefined) filter[key] = toBool(val);
    });
    // rangos numéricos
    const ageMin = toNum(min_age);
    const ageMax = toNum(max_age);
    if (ageMin !== null || ageMax !== null) {
      filter.age_months = {};
      if (ageMin !== null) filter.age_months.$gte = ageMin;
      if (ageMax !== null) filter.age_months.$lte = ageMax;
    }
    const energyMin = toNum(min_energy);
    const energyMax = toNum(max_energy);
    if (energyMin !== null || energyMax !== null) {
      filter.energy_level = {};
      if (energyMin !== null) filter.energy_level.$gte = energyMin;
      if (energyMax !== null) filter.energy_level.$lte = energyMax;
    }
    // búsqueda de texto simple
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { breed: new RegExp(q, "i") },
      ];
    }
    // límite y skip
    const limitNum = limit ? Math.min(5000, parseInt(limit, 10) || 0) : 0; // 0 = sin límite
    const skipNum = skip ? Math.max(0, parseInt(skip, 10) || 0) : 0;
    const query = Pet.find(filter).sort(sort).skip(skipNum);
    if (limitNum > 0) query.limit(limitNum);
    const items = await query.lean();
    // Devuelve array directo
    res.json(items);
  } catch (err) {
    console.error("GET /pets error:", err);
    res.status(500).json({ message: err.message });
  }
});
// --- GET /pets/:id ---
router.get("/:id", async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ message: "Invalid ID" });
    const pet = await Pet.findOne(filter);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// --- POST /pets ---
router.post("/", async (req, res) => {
  try {
    const payload = { ...req.body };
    if ("age_months" in payload) payload.age_months = toNum(payload.age_months);
    if ("weight_kg" in payload) payload.weight_kg = toNum(payload.weight_kg);
    if ("energy_level" in payload)
      payload.energy_level = toNum(payload.energy_level);
    [
      "microchipped",
      "dewormed",
      "spayed_neutered",
      "good_with_dogs",
      "good_with_cats",
      "good_with_kids",
      "house_trained",
    ].forEach((k) => {
      if (k in payload) payload[k] = toBool(payload[k]);
    });
    if ("vaccinated" in payload)
      payload.vaccinated = toArray(payload.vaccinated) || [];
    if ("images" in payload) payload.images = toArray(payload.images) || [];
    const newPet = await Pet.create(payload);
    res.status(201).json(newPet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// --- PUT /pets/:id ---
router.put("/:id", async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ message: "Invalid ID" });
    const payload = { ...req.body };
    if ("age_months" in payload) payload.age_months = toNum(payload.age_months);
    if ("weight_kg" in payload) payload.weight_kg = toNum(payload.weight_kg);
    if ("energy_level" in payload)
      payload.energy_level = toNum(payload.energy_level);
    [
      "microchipped",
      "dewormed",
      "spayed_neutered",
      "good_with_dogs",
      "good_with_cats",
      "good_with_kids",
      "house_trained",
    ].forEach((k) => {
      if (k in payload) payload[k] = toBool(payload[k]);
    });
    if ("vaccinated" in payload)
      payload.vaccinated = toArray(payload.vaccinated) || [];
    if ("images" in payload) payload.images = toArray(payload.images) || [];
    const updatedPet = await Pet.findOneAndUpdate(filter, payload, {
      new: true,
    });
    if (!updatedPet) return res.status(404).json({ message: "Pet not found" });
    res.json(updatedPet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// --- DELETE /pets/:id ---
router.delete("/:id", async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ message: "Invalid ID" });
    const deleted = await Pet.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ message: "Pet not found" });
    res.json({ message: "Pet deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
