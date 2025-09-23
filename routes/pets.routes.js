const router = require("express").Router();
const petModel = require("../models/Pet.model");

router.get("/", async (req, res, next) => {
  try {
    const pet = await petModel.find({ species: req.query.species });
    console.log(pet);
    res.status(200).json(pet);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
