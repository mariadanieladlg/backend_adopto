const router = require("express").Router();
const UserModel = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

//1.SIGNUP TO CHECK USER EMAIL
router.post("/signup", async (req, res) => {
  try {
    // Email already exists?!
    const foundUser = await UserModel.findOne({ email: req.body.email });
    if (foundUser) {
      res.status(403).json({ errorMessage: "Email already taken" });
    } else {
      //Create the salt
      //Create the hashed password

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
    res.status(500).json("Error creating user");
  }
});

//2.LOGIN TO FIND USER EMAIL
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await UserModel.findOne({ email });
    if (!foundUser) {
      return res.status(401).json({ errorMessage: "Invalid credentials" });
    }

    const isPasswordValid = bcryptjs.compareSync(password, foundUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ errorMessage: "Invalid credentials" });
    }

    const payload = { _id: foundUser._id, role: foundUser.role };

    if (!process.env.TOKEN_SECRET) {
      console.error("TOKEN_SECRET missing in .env file");
      return res.status(500).json({ errorMessage: "Server misconfiguration" });
    }

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    res.status(200).json({ message: "Logged in successfully", authToken });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ errorMessage: "Error logging in" });
  }
});

//VERIFY ROUTE
router.get("/verify", isAuthenticated, async (req, res) => {
  res.status(200).json({ message: "Token is good", payload: req.payload });
});

module.exports = router;
