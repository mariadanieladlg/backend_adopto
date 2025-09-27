const { Schema, model } = require("mongoose");
const petSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ["cat", "dog"], required: true },
    lifeStage: { type: String, enum: ["kitten", "adult", "puppy"], trim: true },
    sex: { type: String, enum: ["male", "female"], required: true },
    ageMonths: { type: Number, min: 0, required: true },
    breed: { type: String, default: "Mixed Breed" },
    color: { type: String, trim: true },
    size: { type: String, enum: ["small", "medium", "large"], required: false },
    weightKg: { type: Number, min: 0 },
    locationCity: { type: String, required: true },
    locationCountry: { type: String, required: true },
    microchipped: { type: Boolean, default: false },
    microchipId: { type: String, trim: true },
    vaccinated: [{ type: String }],
    dewormed: { type: Boolean, default: false },
    spayedNeutered: { type: Boolean, default: false },
    goodWith: {
      dogs: { type: Boolean, default: false },
      cats: { type: Boolean, default: false },
      kids: { type: Boolean, default: false },
    },
    energyLevel: { type: Number, min: 1, max: 5 },
    houseTrained: { type: Boolean, default: false },
    description: { type: String, maxlength: 1000 },
    images: [{ type: String }],
    video: { type: String },
    status: {
      type: String,
      enum: ["available", "reserved", "adopted"],
      default: "available",
    },
    adoptionFeeEur: { type: Number, min: 0 },
    postedAt: { type: Date },
    shelterId: { type: String, trim: true },
    contact: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);
module.exports = model("Pet", petSchema);
