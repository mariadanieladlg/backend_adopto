require("dotenv").config();

const express = require("express");
const app = express();

// MIDDLEWARE GLOBAL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TEST DEBUG
app.use((req, res, next) => {
  console.log("Body Received:", req.body);
  next();
});

//CONFIG.
require("./config/index")(app);

// DB CONNECTION
const connectDB = require("./db/index");
connectDB();

// ROUTES
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);

const petRoutes = require("./routes/pets.routes");
app.use("/pets", petRoutes);

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({ message: "server is good!" });
});

// ERROR HANDLING
require("./error-handling/index")(app);

// START SERVER
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
