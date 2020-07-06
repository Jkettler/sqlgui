const { User } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/current", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

module.exports = router;
