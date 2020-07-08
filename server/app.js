const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fs = require("fs");
const initSqlJs = require("sql.js");
const filebuffer = fs.readFileSync("../db/chinook.db");
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

initSqlJs()
  .then(function (SQL) {
    // Load the db
    app.locals.database = new SQL.Database(filebuffer);
  })
  .catch(function (e) {
    app.locals.dbLoadError = e;
  });

mongoose
  .connect("mongodb://localhost/sqlgui", {
    useFindAndModify: false,
    useNewUrlParser: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

const query = require("./routes/query.route");
const auth = require("./routes/auth.route");
const user = require("./routes/user.route");
const queries = require("./routes/user_queries.route");

app.use("/", auth);
app.use("/user", user);
app.use("/api", query);
app.use("/api/user_queries", queries);

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

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
