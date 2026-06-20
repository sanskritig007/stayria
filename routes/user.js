const express= require("express");
const router = express.Router();
const User=require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, saveRedirectUrl } = require("../middleware.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const userController = require("../controllers/user.js");

// Experiences: Show all reviews across all listings
router.get("/experiences", wrapAsync(async (req, res) => {
  const listings = await Listing.find({})
    .populate({
      path: "reviews",
      populate: { path: "author" }
    });

  // Flatten all reviews with listing context
  const allReviews = [];
  listings.forEach(listing => {
    listing.reviews.forEach(review => {
      allReviews.push({
        review,
        listing: {
          _id: listing._id,
          title: listing.title,
          image: listing.image,
          images: listing.images,
          location: listing.location,
          country: listing.country,
        }
      });
    });
  });

  res.render("reviews/index.ejs", { allReviews });
}));


router.get("/", (req, res) => {
    res.redirect("/listings");
});

//router route
router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup))

// router.get("/signup",userController.renderSignupForm)
// router.post("/signup",wrapAsync(userController.signup))

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",{ failureRedirect: "/login",failureFlash:true, }),
userController.login
);

// router.get("/login",userController.renderLoginForm)
// router.post("/login",saveRedirectUrl,passport.authenticate("local",{ failureRedirect: "/login",failureFlash:true, }),
// userController.login
router.get("/logout",userController.logout)

module.exports=router;