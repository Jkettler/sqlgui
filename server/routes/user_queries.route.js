const { User, populate } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { UserQuery } = require("../models/user_query.model");

router.post("/sync", auth, async (req, res) => {
  const {
    user: { _id: id },
  } = req;

  if (id) {
    const queries = req.body
      .filter((q) => !q._id)
      .map((q) => ({ ...q, user: id }));
    const models = await UserQuery.insertMany(queries);

    await User.findByIdAndUpdate(
      id,
      { $addToSet: { queries: models.map((m) => m._id) } },
      { new: true, select: "-password" },
      (err, usr) => populate(err, usr, res)
    );
  }
});

router.delete("/:id", auth, async (req, res) => {
  const {
    user: { _id: id },
    params: { id: queryId },
  } = req;

  if (id && queryId) {
    let uQuery = await UserQuery.findOneAndDelete(queryId);
    await User.findByIdAndUpdate(
      id,
      { $pull: { queries: queryId } },
      { new: true, select: "-password" },
      (err, usr) => populate(err, usr, res)
    );
  }
});

module.exports = router;
