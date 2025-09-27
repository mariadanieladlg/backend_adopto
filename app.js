const express = require("express");
const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);
require("dotenv").config();

// DB connection
const connectDB = require("./db");
connectDB();

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);

const petRoutes = require("./routes/pets.routes");
app.use("/pets", petRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ message: "server is good!" });
});

// ❗ Error handling middleware
require("./error-handling")(app);

// --- START SERVER ---
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
