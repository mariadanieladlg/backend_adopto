require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Pet = require("../models/Pet.model");

(async () => {
  try {
    // 1) Connect to Mongo
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/adopto";
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // 2) Read JSON
    const file = path.join(process.cwd(), "adopto-db.json");
    const raw = fs.readFileSync(file, "utf-8");
    const data = JSON.parse(raw);

    if (!Array.isArray(data.pets)) {
      throw new Error("Invalid adopto-db.json: 'pets' array not found");
    }

    // 3) Clean and insert
    await Pet.deleteMany({});
    console.log("🧹 Cleared pets collection");

    const docs = data.pets.map((p) => ({
      name: p.name,
      species: p.species, // "cat" | "dog"
      lifeStage: p.life_stage, // "kitten" | "adult" | "puppy"
      sex: p.sex, // "male" | "female"
      ageMonths: p.age_months,
      breed: p.breed || "Mixed Breed",
      color: p.color || null,
      size: p.size ?? null,
      weightKg: p.weight_kg ?? null,
      locationCity: p.location_city,
      locationCountry: p.location_country,
      microchipped: !!p.microchipped,
      microchipId: p.microchip_id || null,
      vaccinated: p.vaccinated || [],
      dewormed: !!p.dewormed,
      spayedNeutered: !!p.spayed_neutered,
      goodWith: {
        dogs: !!p.good_with_dogs,
        cats: !!p.good_with_cats,
        kids: !!p.good_with_kids,
      },
      energyLevel: p.energy_level ?? null,
      houseTrained: !!p.house_trained,
      description: p.description || "",
      images: p.images || [],
      video: p.video || null,
      status: p.status || "available",
      adoptionFeeEur: p.adoption_fee_eur ?? null,
      postedAt: p.posted_at ? new Date(p.posted_at) : undefined,
      shelterId: p.shelter_id || null,
      contact: {
        email: p.contact?.email || null,
        phone: p.contact?.phone || null,
      },
      tags: p.tags || [],
    }));

    await Pet.insertMany(docs);
    console.log(`✅ Inserted ${docs.length} pets`);
    await mongoose.disconnect();
    console.log("🎉 Seed complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
})();
