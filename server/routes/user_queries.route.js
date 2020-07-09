const { User, populate } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { UserQuery } = require("../models/user_query.model");

module.exports = router;
