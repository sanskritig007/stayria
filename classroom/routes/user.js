const express= require("express");
const router = express.Router();

//index-users
router.get("/",(req,res)=>{
    res.send("GET for users")
})
//show-users
router.get("/:id",(req,res)=>{
    res.send("GET for show user id")
})

//POSTshow users
router.post("/",(req,res)=>{
    res.send("POST for show users")
})

//delete
router.delete("/:id",(req,res)=>{
    res.send("DELETE for show users")
})

module.exports=router;