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
router.get("/new",isLoggedIn,(req,res)=>{
    console.log(req.user);
    res.render("listings/new");
})

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id)
    .populate("owner")
    .populate({path:"reviews",
        populate:{
            path:"author",
        },
    });
    if(!listing){
        req.flash("error", "Listing you are requested for does not exist!");
        return res.redirect("/listings"); 
    }
    res.render("listings/show",{listing});
}))
//create route
router.post("/",
    isLoggedIn,
    validateListing,
    wrapAsync(async(req,res)=>{
     console.log("USER:", req.user);
     const newListing=new Listing(req.body.listing);
     newListing.owner = req.user._id;
     await newListing.save();
     req.flash("success","New Listing Created!!")
     res.redirect("/listings");
}))
//edit route
// 
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you are requested for does not exist!");
        return res.redirect("/listings"); 
    }
    res.render("listings/edit",{listing});
}))
//update route
// 
router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success", "Listing Updated!"); 
    res.redirect(`/listings/${id}`);
}));
//delete route
router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted"); 
    res.redirect("/listings");
}))

module.exports = router;