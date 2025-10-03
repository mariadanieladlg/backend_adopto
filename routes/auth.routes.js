const router = require("express").Router();
const UserModel = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// Create Token
function createToken(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    username: user.username,
  };

  const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
    algorithm: "HS256",
    expiresIn: "6h",
  });

  return { authToken, payload };
}

// REGISTER
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Email exists?
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
      return res.status(403).json({ errorMessage: "Email already taken" });
    }

    // create hashed password
    const salt = bcryptjs.genSaltSync(12);
    const hashedPassword = bcryptjs.hashSync(password, salt);

    const createdUser = await UserModel.create({
      email,
      username,
      password: hashedPassword,
    });

    const { authToken, payload } = createToken(createdUser);

    res.status(201).json({
      message: "User created successfully",
      authToken,
      payload,
    });
  } catch (error) {
    console.log("❌ Signup error:", error);
    res.status(500).json({ message: "Problem creating user" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await UserModel.findOne({ email });
    if (!foundUser) {
      return res.status(401).json({ errorMessage: "Invalid credentials" });
    }

    const isPasswordCorrect = bcryptjs.compareSync(
      password,
      foundUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ errorMessage: "Invalid credentials" });
    }
    const { authToken, payload } = createToken(foundUser);

    res.status(200).json({
      message: "Login successful",
      authToken,
      payload,
    });
  } catch (error) {
    console.log("❌ Login error:", error);
    res.status(500).json({ message: "Problem logging in user" });
  }
});

// UPDATE USER PROFILE
router.put("/edit", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.payload._id; // id vem do token
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    res.json({ message: "Profile updated", payload: updatedUser });
  } catch (error) {
    next(error);
  }
});

//DELETE

router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// VERIFY
router.get("/verify", isAuthenticated, (req, res) => {
  res.status(200).json({
    message: "Token is valid",
    payload: req.payload,
  });
});

module.exports = router;
