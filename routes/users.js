const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");
const { storeReturnTo } = require('../utils/isauthenticated');
const AsyncError = require("../utils/AsyncError");

router.get("/register", (req, res) => {
  res.render("users/register");
});
router.post(
  "/register",
  AsyncError(async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const newUser = new User({ email, username });
      const registered = await User.register(newUser, password);
      req.login(registered, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Vanhike");
        res.redirect("/hikes");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", `Welcome back!! ${req.body.username}`);
    const redirectUrl = res.locals.returnTo || "/hikes";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  req.flash("success", "Goodbye!!");
  res.redirect("/hikes");
});

module.exports = router;
