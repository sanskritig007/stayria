const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// View bookings dashboard
router.get("/", isLoggedIn, wrapAsync(bookingController.index));

// Mockup payment processing page
router.post("/listings/:id/payment", isLoggedIn, wrapAsync(bookingController.renderPaymentPage));

// Create a booking
router.post("/listings/:id/bookings", isLoggedIn, wrapAsync(bookingController.createBooking));

// Cancel a booking
router.post("/:bookingId/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
