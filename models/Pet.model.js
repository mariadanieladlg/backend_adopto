// models/Pet.model.js
const { Schema, model } = require("mongoose");
const PetSchema = new Schema(
  {
    // Permite buscar por _id o por id numérico (si lo tienes en tu seed)
    id: { type: Number, index: true, unique: true, sparse: true },
    name: { type: String, required: true },
    species: { type: String, enum: ["dog", "cat", "other"], default: "dog" },
    life_stage: {
      type: String,
      enum: ["baby", "young", "adult", "senior"],
      default: "adult",
    },
    sex: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },
    age_months: { type: Number, default: null },
    breed: { type: String, default: null },
    color: { type: String, default: null },
    size: { type: String, default: null },
    weight_kg: { type: Number, default: null },
    location_city: { type: String, default: null },
    location_country: { type: String, default: null },
    microchipped: { type: Boolean, default: false },
    microchip_id: { type: String, default: null },
    vaccinated: [{ type: String }],
    dewormed: { type: Boolean, default: false },
    spayed_neutered: { type: Boolean, default: false },
    good_with_dogs: { type: Boolean, default: false },
    good_with_cats: { type: Boolean, default: false },
    good_with_kids: { type: Boolean, default: false },
    energy_level: { type: Number, min: 1, max: 5, default: 3 },
    house_trained: { type: Boolean, default: false },
    description: { type: String, default: "" },
    // Usa un array de strings para URLs locales (/uploads/...) o absolutas
    images: [{ type: String }],
  },
  { timestamps: true }
);
module.exports = model("Pet", PetSchema);
