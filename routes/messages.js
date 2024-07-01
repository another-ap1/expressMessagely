const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const {SECRET_KEY, DB_URI} = require('../config');
const Message = require('../models/message');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth')

router.use(authenticateJWT);
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", async (req, res, next) => {
    try{
        const {id} = req.body;
        const results = await Message.get(id);
        if(results.from_user === req.user || results.to_user === req.user){
            return res.json({results});
        }else{
            return new ExpressError("you can only read your messages", 400);
        }
    }catch(e){
        return next(e)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async (req, res, next) => {
    try{
        const {to_username, body} = req.body;
        const from_username = req.user.username;
        const results = await Message.create({from_username, to_username, body});
        return res.json(results);
    }catch(e){
        return next(e)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async (req, res, next) => {
    try{
        const {id} = req.body;
        const result = await Message.get(id);
        if(result.to_user !== req.user.username){
            return new ExpressError("cant read", 400);
        }
        const read = await Message.markRead(id);
        return res.json(read);
    }catch(e){
        return next(e)
    }
})

module.exports = router;
