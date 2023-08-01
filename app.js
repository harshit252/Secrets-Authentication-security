require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');

    const userSchema = new mongoose.Schema({
        email: String ,
        password: String
    });

    userSchema.plugin(encrypt,{secret: process.env.SECRET,encryptedFields: ["password"]});

    const User = mongoose.model("User",userSchema);

    app.get("/",function(req,res){
        res.render("home");
    });

    app.get("/login",function(req,res){
        res.render("login");
    });

    app.get("/register",function(req,res){
        res.render("register");
    });

    app.post("/register",async function(req,res){
        const userName = req.body.username;
        const password = req.body.password;
        const user = new User({
            email: userName,
            password: password
        });
        if(await user.save()){
            res.render("secrets");
        } else{
            console.log("error");
        }
    });

    app.post("/login",async function (req,res) {
        const userName = req.body.username;
        const password = req.body.password;

        const foundUser = await User.findOne({email:userName}).exec();
        if(foundUser){
            if(foundUser.password === password){
                res.render("secrets");
            }
        } else {
            res.render("register");
        }
    });



    app.listen(3000,function(){
        console.log("Server is listening in port 3000");
    });
  
}
