const express = require("express");
const router = express.Router({ mergeParams: true });
const asyncError = require("../utils/AsyncError");
const Hike = require("../models/hike");
const Review = require("../models/review");
const { isLoggedIn } = require("../utils/isauthenticated");
const { isReviewAuthor } = require("../utils/isAuthor");

router.post(
  "/",
  isLoggedIn,
  asyncError(async (req, res) => {
    const hike = await Hike.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    hike.reviews.push(review);
    await review.save();
    await hike.save();
    req.flash("success", "You have successfully added a review");
    res.redirect(`/hikes/${hike._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  asyncError(async (req, res) => {
    const { id, reviewId } = req.params;
    const hike = await Hike.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "You have successfully deleted the review");
    res.redirect(`/hikes/${hike._id}`);
  })
);

module.exports = router;
