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
  const { category, q, guests, checkIn, checkOut } = req.query;

  let query = {};

  if (category) {
    query.category = category;
  }
  
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } }
    ];
  }
  
  if (guests && Number(guests) > 0) {
    query.maxGuests = { $gte: Number(guests) };
  }

  let allListings = await Listing.find(query).populate("reviews");

  if (checkIn && checkOut) {
    const Booking = require("../models/booking.js");
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Find bookings that overlap with requested dates
    const overlappingBookings = await Booking.find({
      status: "confirmed",
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });
    
    const bookedListingIds = overlappingBookings.map(b => b.listing.toString());
    
    // Filter out listings that are booked
    allListings = allListings.filter(listing => !bookedListingIds.includes(listing._id.toString()));
  }

  // Create curated destination sections for the homepage (Airbnb style)
  let groupedSections = [];
  const isSearchOrFilter = Boolean(category || q || guests || (checkIn && checkOut));

  if (!isSearchOrFilter && allListings.length > 0) {
    const beachStays = allListings.filter(l => 
      ["Malibu", "Bali", "Cancun", "Costa Rica", "Mykonos", "Maldives", "Phuket", "Fiji", "goa", "Beach"].some(loc => 
        (l.location && l.location.toLowerCase().includes(loc.toLowerCase())) || 
        (l.title && l.title.toLowerCase().includes(loc.toLowerCase()))
      )
    );

    const mountainStays = allListings.filter(l => 
      ["Aspen", "Banff", "Lake Tahoe", "Verbier", "Montana", "New Hampshire", "mountains"].some(loc => 
        (l.location && l.location.toLowerCase().includes(loc.toLowerCase())) || 
        (l.category === "mountains")
      )
    );

    const historicStays = allListings.filter(l => 
      ["Amsterdam", "Charleston", "Florence", "Cotswolds", "Scottish Highlands", "Boston", "Tokyo", "castles", "iconic"].some(loc => 
        (l.location && l.location.toLowerCase().includes(loc.toLowerCase())) || 
        (l.category === "castles" || l.category === "iconic")
      )
    );

    // 1. Trending
    groupedSections.push({
      title: "Trending Stays Worldwide",
      queryParam: "category=trending",
      listings: allListings.slice(0, 8)
    });

    // 2. Beach & Coastal
    if (beachStays.length > 0) {
      groupedSections.push({
        title: "Popular Beach & Coastal Getaways",
        queryParam: "category=pools",
        listings: beachStays
      });
    }

    // 3. Mountain Cabins
    if (mountainStays.length > 0) {
      groupedSections.push({
        title: "Mountain Retreats & Cozy Cabins",
        queryParam: "category=mountains",
        listings: mountainStays
      });
    }

    // 4. Historic & Iconic
    if (historicStays.length > 0) {
      groupedSections.push({
        title: "Iconic Heritage Homes & Castles",
        queryParam: "category=iconic",
        listings: historicStays
      });
    }
  }

  res.render("listings/index", { 
    allListings, 
    groupedSections, 
    isSearchOrFilter, 
    searchPrompt: q || "", 
    currentCategory: category || "" 
  });
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
    
    const newListing=new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.geometry = await geocodeListing(location, country);
    
    if (req.files && req.files.length > 0) {
        newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        newListing.image = newListing.images[0]; // legacy fallback
    } else if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = {url, filename};
        newListing.images = [{url, filename}];
    }

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

    listing.title = fields.title ?? listing.title;
    listing.description = fields.description ?? listing.description;
    listing.price = fields.price ?? listing.price;
    if (fields.maxGuests) {
        listing.maxGuests = Number(fields.maxGuests);
    }
    listing.location = location;
    listing.country = country;
    listing.category = fields.category ?? listing.category;
    listing.geometry = geometry;

    // Migrate legacy image to the images array if it's empty
    if (listing.images.length === 0 && listing.image && listing.image.url) {
        listing.images.push(listing.image);
    }

    // Handle deleted images
    if (req.body.deleteImages) {
        const deleteImages = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];
        listing.images = listing.images.filter(img => !deleteImages.includes(img.filename));
    }

    // Handle new images
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        listing.images.push(...newImages);
    } else if (req.file) {
        listing.images.push({ url: req.file.path, filename: req.file.filename });
    }

    // Enforce 5 images limit
    if (listing.images.length > 5) {
        listing.images = listing.images.slice(0, 5);
    }

    // Ensure backwards compatibility
    if (listing.images.length > 0) {
        listing.image = listing.images[0];
    } else if (!listing.image || !listing.image.url) {
        // Fallback placeholder logic could go here
    }

    await listing.save();

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