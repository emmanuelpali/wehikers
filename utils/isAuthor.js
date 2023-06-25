const Hike = require("../models/hike");
const Review = require("../models/review");
//for the hikes
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const hike = await Hike.findById(id);
  if (!hike.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/hikes/${id}`);
  }
  next();
};

//
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/hikes/${id}`);
  }
  next();
};
