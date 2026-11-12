const express = require("express");
const router = express.Router();
const Ingredient = require("../models/Ingredient");
const Product = require("../models/Product");

// Get all ingredients
router.get("/", async (req, res) => {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.json(ingredients);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
});

// Get single ingredient by name (for the customer frontend later)
router.get("/:name", async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ name: req.params.name });
    if (!ingredient) return res.status(404).json({ message: "Not found" });
    res.json(ingredient);
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
});

// Create a new ingredient (for admin panel)
router.post("/", async (req, res) => {
  try {
    const { name, description, image, images } = req.body;
    const imageList = Array.isArray(images)
      ? images.filter(Boolean)
      : image
        ? [image]
        : [];

    const newIngredient = await Ingredient.create({
      name,
      description,
      images: imageList,
      image: imageList[0] || "",
    });
    res.status(201).json(newIngredient);
  } catch (error) {
    res.status(400).json({
      message:
        error.code === 11000
          ? "An ingredient with this name already exists"
          : "Failed to create",
    });
  }
});

// Update an ingredient (for admin panel)
router.put("/:id", async (req, res) => {
  try {
    const { name, description, image, images } = req.body;
    const update = { name, description };

    if (Array.isArray(images)) {
      const imageList = images.filter(Boolean);
      update.images = imageList;
      update.image = imageList[0] || "";
    } else if (typeof image === "string") {
      update.images = image ? [image] : [];
      update.image = image;
    }

    const updated = await Ingredient.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Ingredient not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({
      message:
        error.code === 11000
          ? "An ingredient with this name already exists"
          : "Failed to update ingredient",
    });
  }
});

// Delete an ingredient
router.delete("/:id", async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });

    await Product.updateMany(
      { ingredients: ingredient.name },
      { $pull: { ingredients: ingredient.name } }
    );

    res.json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: "Server Error" }); }
});

module.exports = router;