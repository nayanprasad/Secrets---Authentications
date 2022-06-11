const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose")


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret : "the hades",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());   // check passport docs ( passportjs.org/docs )
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/secrets", function (req, res) { 
   
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
 })

app.get("/logout", function (req, res) { 
    req.logOut(function (err) { 
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/"); 
        }
     });

 }) 

app.post("/register", function (req, res) {
  //https://www.npmjs.com/package/passport-local-mongoose for docs

  User.register({username : req.body.username}, req.body.password, function (err, user) { 
      if(err){
          console.log(err);
          res.redirect("/register");
      }
      
          passport.authenticate("local")( req, res, function () { 
                res.redirect("/secrets");
                // res.render("secrets");
           });
      
   })
});

app.post("/login", function (req, res) {

    const theUser = new User({
        username : req.body.username,
        password : req.body.password
    })

    req.logIn(theUser, function (err) { 
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")( req, res, function () { 
                res.redirect("/secrets");
                // res.render("secrets");
           });
        }
     })
   
});

app.listen("3000", function () {
    console.log("server started...");
})
