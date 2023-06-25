const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError");
const asyncError = require("../utils/AsyncError");
const Hike = require("../models/hike");
const { isLoggedIn } = require("../utils/isauthenticated");
const { isAuthor } = require("../utils/isAuthor");
const hikeController = require("../controllers/hike");
//image upload
const multer = require("multer");
const { storage } = require("../cloudinary");
const { validateHike } = require("../joiSchema");
const upload = multer({ storage });

router
  .route("/")
  .get(asyncError(hikeController.index))
  .post(
    isLoggedIn,
    upload.array("images"),
    asyncError(hikeController.createHike)
  );

router.get("/new", isLoggedIn, hikeController.newForm);

router
  .route("/:id")
  .get(asyncError(hikeController.singleHike))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("images"),
    asyncError(hikeController.editHike)
  )
  .delete(
    isLoggedIn,
    isAuthor,
    asyncError(async (req, res) => {
      await Hike.findByIdAndDelete(req.params.id);
      req.flash("success", "You have successfully deleted the hike");
      res.redirect("/hikes");
    })
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  asyncError(hikeController.editHikeForm)
);

module.exports = router;
