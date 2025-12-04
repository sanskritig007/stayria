const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStratrgy=require("passport-local");
const User=require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")

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

const sessionOptions={
    secret:"yourStrongSecretKeyHere",
    resave:false,
    saveUninitialized:true,
    cookie:{               //logincookie once you will login you dont hav eto login atleast 1 week if working regularly
        expires: Date.now()+ 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
    },
};

app.get("/",(req,res)=>{//basic api call
    res.send("Hi, I am root");
})

app.use(session(sessionOptions));
app.use(flash());        //must be before routes calling because flash ko routes ke help se use krne wale h  

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratrgy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user; 
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"stayria-user"
//     });
//     let registeredUser= await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})       //for all incoming req's if kisi se match nhi hua to yaha match hoga
//middleware
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Someting went wrong!"}=err; //deconstruct
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})
app.listen(8080,()=>{
    console.log("server is listening to port 8080");
})
