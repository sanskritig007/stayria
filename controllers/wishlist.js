const User = require("../models/user.js");
const Listing = require("../models/listing.js");

module.exports.toggleWishlist = async (req, res) => {
    const { listingId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const listingIndex = user.wishlist.indexOf(listingId);

    let wishlisted = false;

    if (listingIndex > -1) {
        // Already in wishlist, remove it
        user.wishlist.splice(listingIndex, 1);
    } else {
        // Not in wishlist, add it
        user.wishlist.push(listingId);
        wishlisted = true;
    }

    await user.save();

    res.json({ success: true, wishlisted });
};

module.exports.index = async (req, res) => {
    const userId = req.user._id;
    // Populate the wishlist array to get listing details
    const user = await User.findById(userId).populate("wishlist");
    
    res.render("wishlist/index.ejs", { allListings: user.wishlist });
};
