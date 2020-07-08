const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).send("Access denied. No token provided.");

  const parts = token.split(" ");

  if (parts[0] === "Bearer") {
    try {
      req.user = jwt.verify(parts[1], config.get("myprivatekey"));
      next();
    } catch (ex) {
      res.status(400).send(`Invalid token. ${ex}`);
    }
  }
};
