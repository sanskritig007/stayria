const express= require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js")
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js")

const listingController = require("../controllers/listings.js")
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({ storage })


//implementing Router.route ( to make it more compact)
router
 .route("/")
 .get( wrapAsync(listingController.index) )//hamare root route ke pass jaise hi GET req aaye waise hi index naam ka fuction ya jo call back h vo exicute hojye 
 .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
);//create

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);//id wale se uper rkhege warna router wala logic h usse id ki tarah interpret krega aur jo new wala route h usse database ke ander search krne ki kosis krega to error aaskta h .

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing))

//edit route 
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditFrom))
module.exports = router;