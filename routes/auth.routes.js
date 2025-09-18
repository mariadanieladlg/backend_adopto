const router = require("express").Router();
const UserModel = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// sign up route
router.post("/signup", async (req, res) => {
  try {
    const foundUser = await UserModel.findOne({ email: req.body.email });
    if (foundUser) {
      res.status(204).json({ errorMessages: " Email already exists" });
    } else {
      const theSalt = bcryptjs.genSaltSync(12);
      const theHashedPassword = bcryptjs.hashSync(req.body.password, theSalt);
      console.log("the salt", theSalt);
      console.log("the hashed password", theHashedPassword);
      console.log(req.body);
      const hashedUser = {
        ...req.body,
        password: theHashedPassword,
      };
      const createdUser = await UserModel.create(hashedUser);
      res
        .status(201)
        .json({ message: "User created successfully", createdUser });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("problem creating user");
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    const foundUser = await UserModel.findOne({ email: req.body.email });
    if (!foundUser) {
      res.status(500).json({ errorMessage: "invalid credentials" });
    } else {
      const doesPasswordMatch = bcryptjs.compareSync(
        req.body.password,
        foundUser.password
      );
      if (!doesPasswordMatch) {
        res.status(500).json({ errorMessage: "invalid credentials" });
      } else {
        const payload = { _id: foundUser._id };
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.status(200).json({ message: "Login successful!", authToken });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("problem signup user");
  }
});

//verify route
router.get("/verify", isAuthenticated, async (req, res) => {
  res.status(200).json({ message: "Token good" });
});

module.exports = router;
