const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const wishlistController = require("../controllers/wishlist.js");

// View the wishlist
router.get("/", isLoggedIn, wrapAsync(wishlistController.index));

// Toggle a listing in the wishlist (AJAX)
router.post("/:listingId/toggle", isLoggedIn, wrapAsync(wishlistController.toggleWishlist));

module.exports = router;
