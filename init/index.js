require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const dbUrl =
    process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/Stayria";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    let ownerId = process.env.INIT_OWNER_ID;

    if (!ownerId) {
        const user = await User.findOne({});
        if (!user) {
            console.error(
                "Seed failed: set INIT_OWNER_ID in .env or create a user first."
            );
            process.exit(1);
        }
        ownerId = user._id;
    }

    await Listing.deleteMany({});
    const data = initData.data.map((obj) => ({
        ...obj,
        owner: new mongoose.Types.ObjectId(ownerId),
    }));
    await Listing.insertMany(data);
    console.log("data was initialized");
};

initDB();
