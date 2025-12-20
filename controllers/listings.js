const Listing = require("../models/listing.js")

module.exports.index= async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
    console.log(req.user);
    res.render("listings/new");
}
  
module.exports.showListing = async(req,res)=>{
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
}

module.exports.createListing = async(req,res)=>{
     console.log("USER:", req.user);
     const newListing=new Listing(req.body.listing);
     newListing.owner = req.user._id;
     await newListing.save();
     req.flash("success","New Listing Created!!")
     res.redirect("/listings");
}

module.exports.renderEditFrom=async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you are requested for does not exist!");
        return res.redirect("/listings"); 
    }
    res.render("listings/edit",{listing});
}

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success", "Listing Updated!"); 
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted"); 
    res.redirect("/listings");
}