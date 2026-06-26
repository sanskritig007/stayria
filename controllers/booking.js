const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.renderPaymentPage = async (req, res) => {
    const { id } = req.params; // listing id
    const { checkIn, checkOut, guests, totalPrice } = req.body;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Render the payment mockup page, passing along the form data
    res.render("bookings/payment.ejs", { 
        listing, 
        checkIn, 
        checkOut, 
        guests, 
        totalPrice 
    });
};

module.exports.createBooking = async (req, res) => {
    try {
        const { id } = req.params; // listing id
        const { checkIn, checkOut, guests, totalPrice } = req.body;
        
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        // Create booking
        const newBooking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests: Number(guests),
            totalPrice: Number(totalPrice),
            status: "confirmed"
        });

        await newBooking.save();

        req.flash("success", "Reservation confirmed successfully!");
        res.redirect("/bookings");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect(`/listings/${req.params.id}`);
    }
};

module.exports.index = async (req, res) => {
    try {
        // Find bookings made by the current user (My Trips)
        const myTrips = await Booking.find({ user: req.user._id }).populate("listing").sort({ createdAt: -1 });
        
        // Find bookings made ON listings owned by the current user (Host Dashboard)
        // First find all listings owned by the user
        const myListings = await Listing.find({ owner: req.user._id });
        const myListingsIds = myListings.map(l => l._id);
        
        // Then find bookings that reference these listings
        const reservations = await Booking.find({ listing: { $in: myListingsIds } })
            .populate("listing")
            .populate("user")
            .sort({ createdAt: -1 });

        // Calculate analytics
        let totalEarnings = 0;
        let pendingPayouts = 0;
        let totalGuests = 0;
        
        const now = new Date();
        const upcomingReservations = [];
        const pastReservations = [];

        reservations.forEach(booking => {
            if (booking.status !== "cancelled") {
                totalGuests += booking.guests;
                if (new Date(booking.checkIn) >= now) {
                    pendingPayouts += booking.totalPrice;
                    upcomingReservations.push(booking);
                } else {
                    totalEarnings += booking.totalPrice;
                    pastReservations.push(booking);
                }
            } else {
                // Cancelled bookings go to past reservations for record keeping
                pastReservations.push(booking);
            }
        });

        res.render("bookings/index.ejs", { 
            myTrips, 
            upcomingReservations, 
            pastReservations,
            totalEarnings,
            pendingPayouts,
            totalGuests
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/listings");
    }
};

module.exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate("listing");

        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect("/bookings");
        }

        // Check permissions: only the guest or the host can cancel
        const isGuest = booking.user.equals(req.user._id);
        const isHost = booking.listing.owner.equals(req.user._id);

        if (!isGuest && !isHost) {
            req.flash("error", "You don't have permission to do that.");
            return res.redirect("/bookings");
        }

        booking.status = "cancelled";
        await booking.save();

        req.flash("success", "Booking cancelled.");
        res.redirect("/bookings");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/bookings");
    }
};
