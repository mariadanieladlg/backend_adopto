const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
  // Authorization exist?
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify Token
    const payload = jwt.verify(token, process.env.TOKEN_SECRET, {
      algorithms: ["HS256"],
    });

    req.payload = payload;

    next();
  } catch (error) {
    console.error("❌ Invalid token:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { isAuthenticated };
