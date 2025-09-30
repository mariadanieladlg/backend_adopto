const { Schema, model } = require("mongoose");

const pawSchema = new Schema(
  {
    // "lost" or "found"
    status: { type: String, enum: ["lost", "found"], required: true },
    // "dog" or "cat"
    species: { type: String, enum: ["dog", "cat"], required: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, maxlength: 2000 },
    city: { type: String, required: true, trim: true, lowercase: true },
    country: {
      type: String,
      default: "netherlands",
      trim: true,
      lowercase: true,
    },
    // optional contact details
    contact_name: { type: String, trim: true },
    contact_phone: { type: String, trim: true },
    contact_email: { type: String, trim: true, lowercase: true },
    // image
    image_url: { type: String, default: "" },
    // optional geodata in the future
    // location: { type: { type: String, enum: ["Point"] }, coordinates: [Number] },
  },
  { timestamps: true }
);

module.exports = model("Paw", pawSchema);
