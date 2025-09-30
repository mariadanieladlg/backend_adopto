require("dotenv").config();
require("./db"); // connect MongoDB

const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();

// -------- Middlewares --------
app.use(cors()); // frontend request
app.use(express.json()); // JSON
app.use(express.urlencoded({ extended: true })); // classic forms

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// -------- Routes --------
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);

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

const pawRoutes = require("./routes/paw.routes");
app.use("/paw", pawRoutes);

// Health check
// HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({ message: "server is good!" });
});

// -------- Error handling --------
require("./error-handling")(app);

// -------- Start server --------
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`✅ Server up, running on http://localhost:${PORT}`);
// ERROR HANDLING
require("./error-handling/index")(app);

// START SERVER
const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
