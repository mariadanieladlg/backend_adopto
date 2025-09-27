const router = require("express").Router();
const UserModel = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// 1. SIGNUP (Create account)
router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Is there already an user?
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
      return res.status(403).json({ errorMessage: "Email already taken" });
    }

    //Create Hash - Password
    const salt = bcryptjs.genSaltSync(12);
    const hashedPassword = bcryptjs.hashSync(password, salt);

    const newUser = await UserModel.create({
      email,
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Error creating user" });
  }
});

// 2. LOGIN (USER AUTHENTICATOR)
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

    // CREATE JWT TOKEN
    const payload = { _id: foundUser._id, role: foundUser.role };
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    res.status(200).json({
      message: "Logged in successfully",
      authToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Error logging in" });
  }
});

// 3.VERIFY AND VALIDATE TOKEN
router.get("/verify", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "Token is valid", payload: req.payload });
});

module.exports = router;
