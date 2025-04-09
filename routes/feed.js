const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");
const { getPosts, createPost, getPost, updatePost, deletePost } = feedController;

// define some routes
router.post(
  "/post",
  /*
  auth middleware is used to check if the user is authenticated
  as 1st middleware in the chain before the route handler
  */
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }).withMessage("Title must be at least 5 characters long."),
    body("content").trim().isLength({ min: 5 }).withMessage("Content must be at least 5 characters long."),
  ],
  createPost
);

// /feed/posts ==> because we register the router with /feed in app.js
router.get("/posts", isAuth, getPosts);

router.get("/post/:postId", isAuth, getPost); // get a single post by id

/*
put method --> replace the entire resource with the new one
*/
router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }).withMessage("Title must be at least 5 characters long."),
    body("content").trim().isLength({ min: 5 }).withMessage("Content must be at least 5 characters long."),
  ],
  updatePost
);

// delete a post
router.delete("/post/:postId", isAuth, deletePost);

module.exports = router;
