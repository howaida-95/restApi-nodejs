const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feed");
const { getPosts } = feedController;

// define some routes
// /feed/posts ==> because we register the router with /feed in app.js
router.get("/posts", getPosts);

module.exports = router;
