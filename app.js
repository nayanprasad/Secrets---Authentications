const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const encrypt = require('mongoose-encryption');
const bcrypt  = require('bcrypt');
const saltRounds = 10;


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


const User = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if(!err){
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
        
            newUser.save(function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("secrets");
                }
            }); 
        }
        else{
            console.log(err);
        }
    });

});

app.post("/login", function (req, res) {
    User.findOne({ email: req.body.username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        else {
            if (foundUser) {

                bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
                    if(result == true){
                        res.render("secrets");
                    }
                    
                    else{
                        console.log("incorrect password")
                    }
                })
            }
            else {
                console.log("no user found")
            }

        }
    });
});

app.listen("3000", function () {
    console.log("server started...");
})
