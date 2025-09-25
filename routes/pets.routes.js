const router = require("express").Router();
const mongoose = require("mongoose");
const Pet = require("../models/Pet.model");

// GET /pets
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

// GET /pets/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let pet = null;

    // 1
    if (mongoose.Types.ObjectId.isValid(id)) {
      pet = await Pet.findById(id);
    }

    // 2
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
// DELETE
router.delete("/:petId", async (req, res) => {
  try {
    const deletedPet = await Pet.findOneAndDelete({
      id: Number(req.params.petId),
    });
    console.log(deletedPet);
    res.status(200).json({ message: "Pet deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete pet" });
  }
});

module.exports = router;
