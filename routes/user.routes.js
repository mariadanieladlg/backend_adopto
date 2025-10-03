const router = require("express").Router();
const User = require("../models/User.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// UPDATE USER PROFILE
router.put("/edit", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.payload._id; // id vem do token
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated", payload: updatedUser });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
