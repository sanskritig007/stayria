const express= require("express");
const router = express.Router();
const User=require("../models/user.js");
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, saveRedirectUrl } = require("../middleware.js");


router.get("/signup",userController.renderSignupForm)

const userController=require("../controllers/user.js")

router.post("/signup",wrapAsync(userController.signup))

router.get("/login",userController.renderLoginForm)

router.post("/login",saveRedirectUrl,passport.authenticate("local",{ failureRedirect: "/login",failureFlash:true, }),
userController.login
);
router.get("/logout",userController.logout)

module.exports=router;