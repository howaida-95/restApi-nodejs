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
  console.log("wooooooooooooooooooooow called", req); // log the request for debugging
  // handle errors
  const errors = validationResult(req); // check if there are any validation errors
  if (!errors.isEmpty()) {
    // 422 is the status code for unprocessable entity (validation error)
    // send error response
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422; // set the status code
    throw error; // throw the error to be handled by the error handling middleware
  }

  // check if the request has a file (image) attached
  if (!req.file) {
    // send error response
    const error = new Error("No image provided.");
    error.statusCode = 422; // unprocessable entity
    throw error; // throw the error to be handled by the error handling middleware
  }
  // get the image URL from the request file
  const imageUrl = req.file.path.replace("\\", "/"); // replace backslashes with forward slashes for cross-platform compatibility
  // parse data from incoming request
  const title = req.body.title;
  const content = req.body.content;
  // validate data
  if (!title || !content) {
    // send error response
    return res.status(422).json({ message: "Invalid input" });
  }
  // save data to database (simulated here with a console log)
  // send response
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl, // use the image URL from the request file
    creator: {
      name: "Ahmed",
    },
  });
  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Post created successfully",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500; // internal server error
      }
      next(err); // pass the error to the error handling middleware
    });
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
