const router = require("express").Router();
const { isAuthenticated } = require("../middlewares/jwt.middleware");
const { getProfile, updateProfile } = require("../services/user.services");

// ROUTE GET - GET USER PROFILE (PROTECTED)
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    await getProfile(req, res); // call function from service
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Problem fetching user profile" });
  }
});

// ROUTE PUT - UPDATE USER PROFILE (PROTECTED)
router.put("/profile", isAuthenticated, async (req, res) => {
  try {
    await updateProfile(req, res); // call function from service
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Problem updating user profile" });
  }
});

module.exports = router;
