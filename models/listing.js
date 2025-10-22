const mongoose=require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        filename:String,
        url:String,
    },
    price:{
        type:Number,
        required:true,
    },
    location:String,
    country:String,

    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ]
})

listingSchema.post("findOneAndDelete",async(listing)=>{

})
const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;