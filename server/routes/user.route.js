const { User, populate } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/current", auth, async (req, res) => {
  await User.findById(req.user._id, [], [], (err, user) =>
    populate(err, user, res)
  );
});

module.exports = router;
