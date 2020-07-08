const { User, populate } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { UserQuery } = require("../models/user_query.model");

router.post("/sync", auth, async (req, res) => {
  const {
    user: { _id: id },
    body,
  } = req;

  if (id) {
    const queries = body.filter((q) => !q._id).map((q) => ({ ...q, user: id }));
    const models = await UserQuery.insertMany(queries);

    await User.findByIdAndUpdate(
      id,
      { $addToSet: { queries: models.map((m) => m._id) } },
      { new: true, select: "-password" },
      (err, usr) => populate(err, usr, res)
    );
  }
});

router.delete("/delete", auth, async (req, res) => {
  const {
    user: { _id: id },
    body: deleteIds,
  } = req;

  if (id && deleteIds.length) {
    await UserQuery.deleteMany({
      user: id,
      _id: {
        $in: deleteIds,
      },
    });
    await User.findById(id, [], [], (err, user) => populate(err, user, res));
  }
});

module.exports = router;
