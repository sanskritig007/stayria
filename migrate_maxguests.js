require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");

    // Update all existing documents that do NOT have a maxGuests field
    const result = await Listing.updateMany(
        { maxGuests: { $exists: false } },
        { $set: { maxGuests: 4 } }
    );

    console.log(`Updated ${result.modifiedCount} old documents with default maxGuests: 4.`);
    
    mongoose.connection.close();
}

main().catch(console.error);
