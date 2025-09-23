const User = require("../models/User.model");

// Function to get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.headers.payload.payload._id; // JWT saves user in payload
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// Function to Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.headers.payload.payload._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Updates fields from body
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile };
