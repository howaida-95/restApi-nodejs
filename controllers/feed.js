const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const fs = require("fs"); // file system module to delete files
const path = require("path"); // path module to handle file paths
const io = require("../socket");

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
      .populate("creator")
      .sort({ createdAt: -1 }) // sort by createAt data in descending (newest -> oldest)
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
  try {
    // handle errors
    const errors = validationResult(req); // check if there are any validation errors
    if (!errors.isEmpty()) {
      // 422 is the status code for unprocessable entity (validation error)
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422; // set the status code
      throw error; // throw the error to be handled by the error handling middleware
    }

    // check if the request has a file (image) attached
    if (!req.file) {
      const error = new Error("No image provided.");
      error.statusCode = 422; // unprocessable entity
      throw error;
    }

    // get the image URL from the request file
    const imageUrl = req.file.path.replace("\\", "/"); // replace backslashes with forward slashes

    // parse data from incoming request
    const { title, content } = req.body;

    // validate data
    if (!title || !content) {
      const error = new Error("Invalid input");
      error.statusCode = 422;
      throw error;
    }

    // Creates a new Post document
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId,
    });

    // Save the post to database
    const savedPost = await post.save();

    // Find the user and update their posts array
    const user = await User.findById(req.userId);
    user.posts.push(savedPost);
    await user.save();
    /*
    inform other users that new post created 
    before sending a response
    - get the io object
    - emit event to all connected users
    => difference between emit and broadcast 
    is that emit is used to send data to all connected users
    while broadcast is used to send data to all connected users except the sender (for the one that sent the request)
    .emit(event name, data to be sent)
    */
    io.getIo().emit("posts", {
      action: "create",
      post: { ...savedPost._doc, creator: { _id: req.userId, name: user.name } },
    });

    res.status(201).json({
      message: "Post created successfully",
      post: savedPost,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // internal server error
    }
    next(err); // pass the error to the error handling middleware
  }
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
  try {
    const postId = req.params.postId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422;
      throw error;
    }

    let imageUrl = req.body.image;
    const title = req.body.title;
    const content = req.body.content;

    if (req.file) {
      imageUrl = req.file.path.replace("\\", "/");
    }

    if (!imageUrl) {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }

    if (!title || !content) {
      return res.status(422).json({ message: "Invalid input" });
    }

    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator._id.toString() !== req.userId) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    const result = await post.save();
    io.getIo().emit("posts", {
      action: "update",
      post: { ...result._doc, creator: { _id: req.userId, name: result.creator.name } },
    });

    res.status(200).json({ message: "Post updated successfully", post: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
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
*********************************************
inform all connected clients with a new host 
*/
