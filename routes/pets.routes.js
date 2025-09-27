const router = require("express").Router();
const mongoose = require("mongoose");
const Pet = require("../models/Pet.model");

//HELPER: FILTER
function buildIdFilter(idParam) {
  if (mongoose.Types.ObjectId.isValid(idParam)) return { _id: idParam };
  if (!isNaN(Number(idParam))) return { id: Number(idParam) };
  return null;
}
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
function expandCaseVariants(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v;
    const camel = toCamel(k);
    if (camel !== k) out[camel] = v;
  }
  //ALIAS
  if ("good_with_dogs" in obj)
    out.goodWith = { ...(out.goodWith || {}), dogs: !!obj.good_with_dogs };
  if ("good_with_cats" in obj)
    out.goodWith = { ...(out.goodWith || {}), cats: !!obj.good_with_cats };
  if ("good_with_kids" in obj)
    out.goodWith = { ...(out.goodWith || {}), kids: !!obj.good_with_kids };
  if ("house_trained" in obj) out.houseTrained = !!obj.house_trained;
  if ("spayed_neutered" in obj) out.spayedNeutered = !!obj.spayed_neutered;
  if ("location_city" in obj) out.locationCity = obj.location_city ?? null;
  if ("location_country" in obj)
    out.locationCountry = obj.location_country ?? null;
  if ("microchip_id" in obj) out.microchipId = obj.microchip_id ?? null;
  if ("weight_kg" in obj) out.weightKg = obj.weight_kg;
  if ("age_months" in obj) out.ageMonths = obj.age_months;
  if ("adoption_fee_eur" in obj) out.adoptionFeeEur = obj.adoption_fee_eur;
  if ("posted_at" in obj) out.postedAt = obj.posted_at ?? null;
  if ("shelter_id" in obj) out.shelterId = obj.shelter_id ?? null;
  return out;
}
// Helper
function normalizePayload(body) {
  const payload = { ...body };
  // convert "4,9" to 4.9 and strings
  const toNumber = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    if (typeof v === "string") v = v.replace(",", ".");
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  if ("age_months" in payload)
    payload.age_months = toNumber(payload.age_months);
  if ("weight_kg" in payload) payload.weight_kg = toNumber(payload.weight_kg);
  if ("adoption_fee_eur" in payload)
    payload.adoption_fee_eur = toNumber(payload.adoption_fee_eur);
  if ("energy_level" in payload)
    payload.energy_level = toNumber(payload.energy_level);
  const toBool = (v) => !!(v === true || v === "true" || v === 1 || v === "1");
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
  const toArray = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string"
      ? v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  if ("vaccinated" in payload) payload.vaccinated = toArray(payload.vaccinated);
  if ("tags" in payload) payload.tags = toArray(payload.tags);
  if ("images" in payload) payload.images = toArray(payload.images);
  [
    "breed",
    "color",
    "size",
    "location_city",
    "location_country",
    "microchip_id",
    "video",
    "status",
    "shelter_id",
  ].forEach((k) => {
    if (k in payload && payload[k] === "") payload[k] = null;
  });
  return expandCaseVariants(payload);
}
// GET PETS
router.get("/", async (req, res) => {
  try {
    const { species } = req.query;
    const query = {};
    if (species) query.species = species;
    const pets = await Pet.find(query);
    res.status(200).json(pets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pets" });
  }
});

// GET PETS ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let pet = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      pet = await Pet.findById(id);
    }
    if (!pet && !isNaN(Number(id))) {
      pet = await Pet.findOne({ id: Number(id) });
    }
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.status(200).json(pet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pet" });
  }
});

//PUT (UPDATE PETS)
router.put("/:id", async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ message: "Invalid id" });
    const $set = normalizePayload(req.body);
    const updated = await Pet.findOneAndUpdate(
      filter,
      { $set },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Pet not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Update failed" });
  }
});

// PATCH (PARTIAL UPDATE)
router.patch("/:id", async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ message: "Invalid id" });
    const $set = normalizePayload(req.body);
    const updated = await Pet.findOneAndUpdate(
      filter,
      { $set },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Pet not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Update failed" });
  }
});

// DELETE PETS
router.delete("/:id", async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    if (!filter) return res.status(400).json({ message: "Invalid id" });
    const deleted = await Pet.findOneAndDelete(filter);
    if (!deleted) return res.status(404).json({ message: "Pet not found" });
    res.status(200).json({ message: "Pet deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete pet" });
  }
});
module.exports = router;
