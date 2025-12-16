const express= require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema , reviewSchema}=require("../schema.js");
const Listing = require("../models/listing.js")
const {isLoggedIn}=require("../middleware.js")

const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }else{
        next();
    }
}


//index route

// router.post("/", wrapAsync(async (req, res) => {
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     req.flash("success", "New Listing Created!");  // flash set here
//     res.redirect("/listings");                     // redirect triggers next request
// }));

router.get("/",wrapAsync(async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
}))
//new route
router.get("/new",isLoggedIn,(req,res)=>{
    console.log(req.user);
    res.render("listings/new");
})

//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id).populate("owner").populate("reviews");
    if(!listing){
        req.flash("error", "Listing you are requested for does not exist!");
        res.redirect("/listings"); 
    }
    console.log(listing);
    res.render("listings/show",{listing});
}))
//create route
router.post("/",
    isLoggedIn,
    validateListing,
    wrapAsync(async(req,res)=>{
        console.log("USER:", req.user);
     const newListing=new Listing(req.body.listing);
     newListing.owner = req.user.id;
     await newListing.save();
     req.flash("success","New Listing Created!!")
     res.redirect("/listings");
}))
//edit route
// 
router.get("/:id/edit",isLoggedIn,wrapAsync(async (req,res)=>{
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
    validateListing,
    wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
    req.flash("success", "Listing Updated!"); 
    res.redirect(`/listings/${id}`);
}));
//delete route
router.delete("/:id",isLoggedIn,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted"); 
    res.redirect("/listings");
}))

module.exports = router;