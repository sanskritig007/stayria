const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");

//connect the database
main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/Stayria');
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{//basic api call
    res.send("Hi, I am root");
})

//index route
app.get("/listings",async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index",{allListings});
})
//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new");
})

//show route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/show",{listing});
})
//create route
app.post("/listings",async(req,res)=>{
//     let{title,description ,image,privateDecrypt,country,location}=req.body; //variable extraction
const newListing=new Listing(req.body.listing);
await newListing.save();
res.redirect("/listings");
})
//edit route
app.get("/listings/:id/edit",async (req,res)=>{
    let {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/edit",{listing});
})
//update route
app.put("/listings/:id",async(req,res)=>{
   const { id } = req.params;
    console.log(req.body);
    await Listing.findByIdAndUpdate(id, {
        $set:{ "image.url": req.body.listing.image.url } });
    res.redirect(`/listings/${id}`);
   
});
//delete route
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})
//testListing route
// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"By the Beach",
//         price:1200,
//         location:"Calangute,Goa",
//         country:"India",
//     });
    
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });
//server start at port 8080
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})
