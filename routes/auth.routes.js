const router = require("express").Router();
const { register, signin, verify } = require("../services/auth.services");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

//***REGISTER Route
router.post("/register", async (req, res) => {
  try {
    await register(req, res); // call auth.service register
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Problem creating user" });
  }
});

// ****SIGNIN Route
router.post("/signin", async (req, res) => {
  try {
    await signin(req, res); // call auth.service signin
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Problem signing in" });
  }
});

// ****Verify Route
router.get("/verify", isAuthenticated, async (req, res) => {
  try {
    await verify(req, res); // call auth.service verify
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Problem verifying token" });
  }
});

module.exports = router;
