// app.js
require("dotenv").config();
require("./db"); // conect MongoDB

const express = require("express");

const app = express();

require("./config")(app); // middlewares

// Routes
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

// Import and register user routes
const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes); //all routes starts with users

// Health check (opcional)
app.get("/health", (req, res) => {
  res.status(200).json({ message: "server is good!" });
});

// Error handling
require("./error-handling")(app);

// Start server
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server up, running on http://localhost:${PORT}`);
});
