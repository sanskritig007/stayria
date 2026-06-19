const Listing = require("../models/listing.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const ExpressError = require("../utils/ExpressError.js");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

async function geocodeListing(location, country) {
    const query = [location, country].filter(Boolean).join(", ");
    const options = { query, limit: 1 };

    const countryCodes = {
        india: "in",
        "united states": "us",
        usa: "us",
        italy: "it",
        mexico: "mx",
        france: "fr",
        spain: "es",
    };
    const countryCode = country && countryCodes[country.trim().toLowerCase()];
    if (countryCode) {
        options.countries = [countryCode];
    }

    const response = await geocodingClient
        .forwardGeocode(options)
        .send();

    const feature = response.body.features?.[0];
    if (!feature) {
        throw new ExpressError(400, "Could not find that location on the map.");
    }
    return {
        type: "Point",
        coordinates: feature.geometry.coordinates,
    };
}

function getListingBody(req) {
    if (req.body.listing && typeof req.body.listing === "object") {
        return req.body.listing;
    }
    const listing = {};
    for (const [key, value] of Object.entries(req.body)) {
        const match = key.match(/^listing\[(.+)\]$/);
        if (match) listing[match[1]] = value;
    }
    return listing;
}

// module.exports.index= async (req,res)=>{
//     const allListings=await Listing.find({});
//     res.render("listings/index",{allListings});
// }

module.exports.renderNewForm = (req,res)=>{
    console.log(req.user);
    res.render("listings/new");
}

module.exports.index = async (req, res) => {
  const { category, q } = req.query;

  let allListings;

  if (category) {
    allListings = await Listing.find({ category });
  } else if (q) {
    allListings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } }
      ]
    });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index", { allListings, searchPrompt: q || "" });
};
  
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

module.exports.createListing = async(req,res,next)=>{
    const { location, country } = req.body.listing;

    let url= req.file.path;
    let filename= req.file.filename;
    
    const newListing=new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image={url,filename};
    newListing.geometry = await geocodeListing(location, country);
    let savedListing=await newListing.save();
      console.log(savedListing)
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

    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit",{listing,originalImageUrl});
}

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you are requested for does not exist!");
        return res.redirect("/listings");
    }

    const fields = getListingBody(req);
    const location = (fields.location ?? listing.location).trim();
    const country = (fields.country ?? listing.country).trim();
    const geometry = await geocodeListing(location, country);

    const update = {
        title: fields.title ?? listing.title,
        description: fields.description ?? listing.description,
        price: fields.price ?? listing.price,
        location,
        country,
        category: fields.category ?? listing.category,
        geometry,
    };

    if (req.file) {
        update.image = { url: req.file.path, filename: req.file.filename };
    }

    await Listing.findByIdAndUpdate(id, update, { runValidators: true });

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