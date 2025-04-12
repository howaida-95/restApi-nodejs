const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs"); // file system module to delete files
const path = require("path"); // path module to handle file paths

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1; // get the current page from the query string or default to 1
  const perPage = 2; // number of posts per page
  let totalItems; // variable to store total number of posts

  try {
    const count = await Post.find().countDocuments(); // find all posts in the database & count the total number of posts in the database
    totalItems = count; // set the total number of posts
    // find all posts in the database
    // skip the posts that are already displayed on previous pages
    // limit the number of posts to be displayed on the current page
    // note --> .exec (return a promise)
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Fetched posts successfully.",
      posts: posts,
      totalItems: totalItems, // send the total number of posts as a response
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // internal server error
    }
    next(err); // pass the error to the error handling middleware
  }
};

exports.createPost = async (req, res, next) => {
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
  let creator;
  // validate data
  if (!title || !content) {
    // send error response
    return res.status(422).json({ message: "Invalid input" });
  }

  // save data to database (simulated here with a console log)
  // send response
  // Creates a new Post document
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl, // use the image URL from the request file
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      /*
      add the post to the user's posts array in the database
      */
      return User.findById(req.userId);
    })
    .then((user) => {
      // updating user then save it to db
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      console.log(result); // result here is the user
      res.status(201).json({
        message: "Post created successfully",
        post: post,
        creator: { _id: creator._id, name: creator.name },
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

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId; // get the post id from the request parameters
  const errors = validationResult(req); // check if there are any validation errors
  if (!errors.isEmpty()) {
    // 422 is the status code for unprocessable entity (validation error)
    // send error response
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422; // set the status code
    throw error; // throw the error to be handled by the error handling middleware
  }

  let imageUrl = req.body.image;
  // parse data from incoming request
  const title = req.body.title;
  const content = req.body.content;

  // check if the request has a file (image) attached
  if (req.file) {
    // get the image URL from the request file
    /*
    if no image uplaoded then use the old image URL from the database
    if image uploaded then use the new image URL from the request file
    */
    imageUrl = req.file.path.replace("\\", "/"); // replace backslashes with forward slashes for cross-platform compatibility
  }
  if (!imageUrl) {
    // send error response
    const error = new Error("No image provided.");
    error.statusCode = 422; // unprocessable entity
    throw error; // throw the error to be handled by the error handling middleware
  }
  // parse data from incoming request
  // validate data
  if (!title || !content) {
    // send error response
    return res.status(422).json({ message: "Invalid input" });
  }
  Post.findById(postId) // find the post by id in the database
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404; // not found
        throw error; // throw the error to be handled by the error handling middleware, so it will be caught by the catch block
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized");
        error.statusCode = 403; // forbidden
        throw error; // throw the error to be handled by the error handling middleware
      }

      if (imageUrl !== post.imageUrl) {
        // if the image URL has changed (new image uploaded)
        clearImage(post.imageUrl); // delete the old image from the server
      }
      post.title = title; // update post title with new title from request body
      post.content = content; // update post content with new content from request body
      post.imageUrl = imageUrl; // update post image URL with new image URL from request file

      // save updated post to database
      return post.save(); // save updated post to database and return it as a promise
    })
    .then((result) => {
      res.status(200).json({ message: "Post updated successfully", post: result }); // send success response with updated post data
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500; // internal server error
      } // pass the error to the error handling middleware
      next(err); // pass the error to the error handling middleware
    });
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId; // get the post id from the request parameters
  Post.findById(postId) // find the post by id in the database
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post.");
        error.statusCode = 404; // not found
        throw error; // throw the error to be handled by the error handling middleware, so it will be caught by the catch block
      }
      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized");
        error.statusCode = 403; // forbidden
        throw error; // throw the error to be handled by the error handling middleware
      }
      clearImage(post.imageUrl); // delete the image from server

      return Post.findByIdAndDelete(postId); // delete the post from database and return it as a promise
    })
    .then(() => {
      // clear the relation between post & user (pull ref in user model)
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId); // remove the post from the user's posts array
      return user.save(); // save the updated user to database
    })
    .then((result) => {
      res.status(200).json({ message: "Post deleted successfully", post: result }); // send success response with deleted post data
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500; // internal server error
      } // pass the error to the error handling middleware
      next(err); // pass the error to the error handling middleware
    });
};

/* delete image handler
trigger this function when uploaded image is updated or deleted
this function will delete the old image from the server
*/
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath); // join the directory name with the file path
  fs.unlink(filePath, (err) => {
    console.log(err); // log any error that occurs while deleting the file
  });
};

/*
notes
======
no res.render(view)
because rest api returns json data not views
*/
