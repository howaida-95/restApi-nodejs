const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const feedController = require("../controllers/feed");
const { getPosts, createPost, getPost } = feedController;

// define some routes
// /feed/posts ==> because we register the router with /feed in app.js
router.get("/posts", getPosts);
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }).withMessage("Title must be at least 5 characters long."),
    body("content").trim().isLength({ min: 5 }).withMessage("Content must be at least 5 characters long."),
  ],
  createPost
);
router.get("/post/:postId", getPost); // get a single post by id

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }).withMessage("Title must be at least 5 characters long."),
    body("content").trim().isLength({ min: 5 }).withMessage("Content must be at least 5 characters long."),
  ],
  createPost
);
module.exports = router;
