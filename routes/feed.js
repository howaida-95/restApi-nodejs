const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feed");
const { getPosts, createPost } = feedController;

// define some routes
// /feed/posts ==> because we register the router with /feed in app.js
router.get("/posts", getPosts);
router.post("/post", createPost);

module.exports = router;
