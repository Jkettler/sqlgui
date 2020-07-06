const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserQuerySchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  query: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const UserQuery = mongoose.model("UserQuery", UserQuerySchema);

exports.UserQuery = UserQuery;
