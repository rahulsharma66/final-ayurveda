const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  image: { type: String }, // Kept for backward compatibility (first image)
  images: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Ingredient", ingredientSchema);