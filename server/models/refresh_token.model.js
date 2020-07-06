const mongoose = require("mongoose");
const { uuid } = require("uuidv4");

const RefreshTokenSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Date,
    required: true,
  },
});

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);

const createNewForUser = (user) => {
  const token = uuid();
  const doc = new RefreshToken({
    user_id: user._id,
    refresh_token: token,
    expires_at: new Date(new Date().getTime() + 60 * 24 * 30 * 60 * 1000),
  });
  doc.save();
  return doc;
};

exports.RefreshToken = RefreshToken;
exports.createNewForUser = createNewForUser;
