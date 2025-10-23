const express= require("express");
const router = express.Router();

//Posts
//indexs
router.get("/",(req,res)=>{
    res.send("GET for posts")
})
//show-users
router.get("/:id",(req,res)=>{
    res.send("GET for post ")
})

//POSTshow users
router.post("/",(req,res)=>{
    res.send("POST for post ")
})

//delete
router.delete("/:id",(req,res)=>{
    res.send("DELETE for post ")
})

module.exports=router;