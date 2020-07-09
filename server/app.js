const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const initSqlJs = require("sql.js");
const filebuffer = fs.readFileSync("./db/chinook.db");
const cors = require("cors");
const config = require("config");
const mongoose = require("mongoose");

const app = express();

const helmet = require("helmet");
app.use(helmet());

if (!config.get("myprivatekey")) {
  console.error("FATAL ERROR: myprivatekey is not defined.");
  process.exit(1);
}

// Load the SQLite db
initSqlJs()
  .then(function (SQL) {
    app.locals.database = new SQL.Database(filebuffer);
  })
  .catch(function (e) {
    app.locals.dbLoadError = e;
  });

// Load and connect to Mongo
mongoose
  .connect(config.get("localMongoAddress"), {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(cors({ credentials: true, origin: config.get("origin") }));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const query = require("./routes/query.route");
const auth = require("./routes/auth.route");
const user = require("./routes/user.route");
// const userQueries = require("./routes/user_queries.route");

app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/query", query);
// app.use("/api/user_queries", userQueries);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // handle @hapi/boom errors if present
  let statusCode;
  if (err && err.output) {
    ({ statusCode = "401" } = err);
  }

  res.status(err.status || statusCode);
  res.send(err);
});

module.exports = app;
