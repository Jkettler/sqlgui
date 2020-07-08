const express = require("express");
const router = express.Router();
const Boom = require("@hapi/boom");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");

const {
  RefreshToken,
  createNewForUser,
} = require("../models/refresh_token.model");
const { User, validate } = require("../models/user.model");

router.post("/register", async (req, res, next) => {
  const { error, value } = validate(req.body);

  if (error) {
    return next(Boom.badRequest(error.details[0].message));
  }

  const { name, password } = value;

  let existing_user = await User.findOne({ name: name });
  if (existing_user)
    return next(Boom.preconditionFailed("Username already exists"));

  try {
    await bcrypt.hash(password, 10);
  } catch (e) {
    console.error(e);
    return next(Boom.badImplementation("Unable to generate 'password hash'"));
  }

  let user;
  try {
    user = new User({
      name: req.body.name,
      password: req.body.password,
    });

    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
  } catch (e) {
    return next(Boom.badImplementation("Unable to create user."));
  }

  const jwToken = user.generateAuthToken();

  // expires after 15 minutes
  const jwTokenExpiry = new Date(new Date().getTime() + 15 * 60 * 1000);

  let refreshToken;
  try {
    refreshToken = createNewForUser(user);
  } catch (e) {
    console.error(e);
    return next(
      Boom.badImplementation("Could not update refresh token for user")
    );
  }

  res.cookie("refreshToken", refreshToken.refresh_token, {
    maxAge: 60 * 24 * 30 * 60 * 1000, // convert from minute to milliseconds
    httpOnly: true,
    secure: true,
  });

  // return jwt token and refresh token to client
  res.json({
    jwToken,
    jwTokenExpiry,
  });
});

router.post("/logout", auth, async (req, res, next) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.send("OK");
});

router.post("/login", async (req, res, next) => {
  // validate username and password
  const { error, value } = validate(req.body);

  if (error) {
    return next(Boom.badRequest(error.details[0].message));
  }

  const { name, password } = value;
  let user;

  try {
    user = await User.findOne({ name: name }).orFail();
  } catch (e) {
    return next(Boom.unauthorized("Unable to find 'user'"));
  }

  // see if password hashes matches
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    console.error("Password does not match");
    return next(Boom.unauthorized("Invalid username or password"));
  }

  const jwToken = user.generateAuthToken();

  // expires after 15 minutes
  const jwTokenExpiry = new Date(new Date().getTime() + 15 * 60 * 1000);

  let refreshToken;
  try {
    refreshToken = createNewForUser(user);
  } catch (e) {
    console.error(e);
    return next(
      Boom.badImplementation("Could not update refresh token for user")
    );
  }

  res.cookie("refreshToken", refreshToken.refresh_token, {
    maxAge: 60 * 24 * 30 * 60 * 1000, // convert from minute to milliseconds
    httpOnly: true,
    secure: true,
  });

  // return jwt token and refresh token to client
  res.json({
    jwToken,
    jwTokenExpiry,
  });
});

router.post("/refresh-token", async (req, res, next) => {
  const refresh_token = req.cookies["refreshToken"];

  let oldRefreshToken;
  try {
    oldRefreshToken = await RefreshToken.findOne({ refresh_token }).orFail();
  } catch (e) {
    return next(Boom.unauthorized("Invalid refresh token request"));
  }

  const user = await User.findById(oldRefreshToken.user_id);

  // delete current refresh token and insert a one in mongo
  let refreshToken;
  try {
    await RefreshToken.findOneAndDelete({ user_id: user.id });
    refreshToken = createNewForUser(user);
  } catch (e) {
    return next(Boom.unauthorized("Invalid 'refresh_token' or 'user_id'"));
  }

  // generate new jwt token
  const jwToken = user.generateAuthToken();
  const jwTokenExpiry = new Date(new Date().getTime() + 15 * 60 * 1000);

  res.cookie("refreshToken", refreshToken.refresh_token, {
    maxAge: 60 * 24 * 30 * 60 * 1000,
    httpOnly: true,
    secure: true,
  });

  res.json({
    jwToken,
    jwTokenExpiry,
  });
});

module.exports = router;
