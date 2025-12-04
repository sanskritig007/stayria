module.exports.isLoggedIn=(req,res,next)=>{
    // console.log(req.path,"..",req.originalUrl);
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl//redirectUrl save  ..middleware ke pass req.session  ki excess to hogi hi to uske baad kahi bhi redirect krvana hoga hum yaha se access krskte h 
        req.flash("error","you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();//user authenticated hota h to next ko call krdo nhi to redirect to /login route
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}