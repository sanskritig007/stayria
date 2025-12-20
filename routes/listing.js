const express= require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js")
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js")

const listingController = require("../controllers/listings.js")



//index route

// router.post("/", wrapAsync(async (req, res) => {
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     req.flash("success", "New Listing Created!");  // flash set here
//     res.redirect("/listings");                     // redirect triggers next request
// }));

router.get(
    "/",
    wrapAsync(listingController.index) 
); //hamare root route ke pass jaise hi GET req aaye waise hi index naam ka fuction ya jo call back h vo exicute hojye 

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);


//show route
router.get("/:id",wrapAsync(listingController.showListing));
//create route
router.post("/",
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.createListing))
//edit route
// 
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditFrom))
//update route
// 
router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing));
//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))

module.exports = router;