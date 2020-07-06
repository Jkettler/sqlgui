const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  queries: [{ type: Schema.Types.ObjectId, ref: "UserQuery" }],
});

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, config.get("myprivatekey"));
};

const User = mongoose.model("User", UserSchema);

function populateCallback(err, user, res) {
  const opts = [{ path: "queries", select: "name query" }];

  return User.populate(user, opts, (err, user) => {
    res.send(user);
  });
}

function validateUser(user) {
  const schema = Joi.object().keys({
    name: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(3).max(255).required(),
  });
  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
exports.populate = populateCallback;
