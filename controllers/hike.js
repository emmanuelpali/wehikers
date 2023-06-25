const Hike = require("../models/hike");
const mapboxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapboxGeoCoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
const ExpressError = require("../utils/ExpressError");

module.exports.index = async (req, res) => {
  const hikes = await Hike.find({});
  res.render("hikes/index", { hikes });
};

module.exports.newForm = (req, res) => {
  res.render("hikes/new");
};

module.exports.createHike = async (req, res) => {
  if (!req.body.hike)
    throw new ExpressError("Please provide the necessary data", 400);
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.hike.location,
      limit: 1,
    })
    .send();
  const newhike = new Hike(req.body.hike);
  newhike.geometry = geoData.body.features[0].geometry;
  newhike.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newhike.author = req.user._id;
  await newhike.save();
  console.log(newhike);
  req.flash("success", "You have successfully added a new Hike");
  res.redirect(`/hikes/${newhike._id}`);
};

module.exports.singleHike = async (req, res) => {
  const singlehike = await Hike.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!singlehike) {
    req.flash("error", "Resource not found");
    return res.redirect("/hikes");
  }
  res.render("hikes/show", { singlehike });
};

module.exports.editHikeForm = async (req, res) => {
  const singlehike = await Hike.findById(req.params.id);
  if (!singlehike) {
    req.flash("error", "Cannot find requested resourse");
    return res.redirect("/hikes");
  }
  res.render("hikes/edit", { singlehike });
};

module.exports.editHike = async (req, res) => {
  const hike = await Hike.findByIdAndUpdate(req.params.id, {
    ...req.body.hike,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  hike.images.push(...imgs);
  await hike.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await hike.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "You have successfully updated this Hike");
  res.redirect(`/hikes/${hike._id}`);
};
