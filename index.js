if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override"); // to allow updates and deletions. check middlewares
const ejsMate = require("ejs-mate");
const Joi = require('joi');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const MongoDBStore = require("connect-mongo");

//require routes
const hikesRoutes = require("./routes/hike");
const reviewsRoutes = require("./routes/review");
const usersRoutes = require("./routes/users");
//connect to database
const dbUrl = process.env.MONGO_URL
const secret = process.env.SECRET || "sess secret";
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//shorten code by using the variable db
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Database connected");
});



app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on("error", function (e) {
  console.log("session store error");
});
const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // httponly is security against scripting
    httpOnly: true,
    // secure: true,
    // a week: 1000 milliseconds in a second. 60 sec in a min, 60min in hour , 24h in a day,
    // do you really want me to write what comes next?
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
//has to come after session above
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
//passport.serializeUser is how to store a user to a session
//passport deserialize is the reverse
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/hikes", hikesRoutes);
app.use("/hikes/:id/review", reviewsRoutes);
app.use("/", usersRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// error handling
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "something went wrong!!";
  res.status(statusCode).render("error", { err });
});

//server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("listening");
});
