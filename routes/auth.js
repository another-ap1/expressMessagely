const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const jwt = require("jsonwebtoken")
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config");
//const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

router.post("/login", async (req, res, next) => {
    try{
        const {username, password} = req.body;
        if(!username || !password){
            return new ExpressError("Invalid username/password", 400);
        }

        //send username and password to user class to authenticate
        const result = await User.authenticate(username, password);
        //if there is no result
        if(!result){
            return new ExpressError("Invalid username/password", 400);
        }
        //upate the users timestamp
        User.updateLoginTimestamp(username);
        //Create a token
        const token = jwt.sign({username}, SECRET_KEY);
        return res.json({token});

    }catch(e){
        return next(e);
    }
});

router.post("/register", async (req, res, next) => {
    try{
        console.log(req.body)
        const { username, 
                password, 
                first_name, 
                last_name, 
                phone } = req.body;

        if(!username || !password || !first_name || !last_name || !phone ) {
            return new ExpressError("Please Provide all required information", 400);
        }
        //call register from user class to add to db
        const user = await User.register({username, password, first_name, last_name, phone});
        //if nothing comes back throw this error
        if(!user.username){
            return new ExpressError("Registration was unable to complete", 400)
        }
        //create token and return it
        const payload = {username: user.username};
        const token = jwt.sign(payload, SECRET_KEY);
        return res.json({token});

    }catch(e){
        return next(e);
    }
})

module.exports = router;
