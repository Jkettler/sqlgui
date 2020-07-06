const express = require("express");
const router = express.Router();

router.post("/query", function (req, res, next) {
  const {
    app: {
      locals: { database },
    },
  } = res;

  if (database) {
    let results, error;
    try {
      results = database.exec(req.body.query);
    } catch (e) {
      error = e.message;
    }
    res.send({ results, error });
  } else {
    res.send({ error: "LoadError: no DB file found" });
  }
});

module.exports = router;
