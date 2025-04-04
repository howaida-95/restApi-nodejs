const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = async (req, res, next) => {
  // fetch data from database (simulated here with a console log)
  Post.find()
    .then((posts) => {
      res.status(200).json({ message: "Fetched posts successfully.", posts: posts }); // send the posts data as a response
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500; // internal server error
      }
      next(err); // pass the error to the error handling middleware
    });
};

exports.createPost = async (req, res, next) => {
  console.log("wooooooooooooooooooooow called"); // log the request for debugging
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId; // get the post id from the request parameters
  // find the post by id in the database (simulated here with a console log)
  Post.findById(postId) // find the post by id in the database
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404; // not found
        throw error; // throw the error to be handled by the error handling middleware, so it will be caught by the catch block
      }
      res.status(200).json({ message: "post fetched", post: post }); // send the post data as a response
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500; // internal server error
      }
      next(err); // pass the error to the error handling middleware
    });
};

/*
notes
======
no res.render(view)
because rest api returns json data not views
*/
