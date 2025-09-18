const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
  try {
    if (
      req.headers.authorization.split(" ")[0] === "Bearer" &&
      req.headers.authorization.split(" ")[1]
    ) {
      const theToken = req.headers.authorization.split(" ")[1];
      const theData = jwt.verify(theToken, process.env.TOKEN_SECRET);
      req.headers.payload = theData;
      next();
    } else {
      res.status(400).json({ errorMessage: "no token" });
    }
  } catch (error) {
    res.status(403).json({ errorMessage: "Invalid Token" });
  }
}
module.exports = { isAuthenticated };
