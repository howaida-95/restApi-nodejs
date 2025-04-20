// import mongoose user model
const User = require("../models/User");
const Post = require("../models/Post");
// to hash the password
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { clearImage } = require("../util/file"); // import the clearImage function to delete the image from the server

const validateField = (fieldName, value, minLength = 5) => {
  if (validator.isEmpty(value)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
    });
  } else if (!validator.isLength(value, { min: minLength })) {
    errors.push({
      field: fieldName,
      message: `${fieldName} should be at least ${minLength} characters long`,
    });
  }
};

module.exports = {
  //   hello() {
  //     return {
  //       text: "hello world",
  //       views: 124,
  //     };
  //   },

  createUser: async (args, req) => {
    const { email, name, password } = args.userInput;
    // validation
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({
        message: " Invalid email",
      });
    }
    if (validator.isEmpty(password) || !validator.isLength(password, { min: 8 })) {
      errors.push({
        message: "Password should be at least 8 characters long",
      });
    }

    if (errors.length > 0) {
      const error = new Error("invalid input");
      error.data = errors; // array of errors
      error.code = 422; // unprocessable entity
      throw error; // throw error to be caught by the error handler
    }

    // check if the user exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    /* 
      create a new user
        1- hash the user 
        2- create a new user with the hashed password
    */
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      name: name,
      password: hashedPassword,
    });

    const createdUser = await user.save(); // this returned the created user
    return {
      ...createdUser._doc,
      _id: createdUser._id.toString(), //convert id obj into string
    };
  },

  /*
  => existing user by finding the user by email
  => check if the password is correct by comparing the hashed password with the entered password
  => token is created using the jwt.sign method 
  which takes the user id and email as payload and a secret key and an expiration time

*/
  login: async (args, req) => {
    const { email, password } = args;
    // check if the user exists
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      const error = new Error("User does not exist");
      error.code = 401; // unauthorized
      throw error;
    }
    // check if the password is correct
    const isEqual = await bcrypt.compare(password, existingUser.password);
    if (!isEqual) {
      const error = new Error("Password is incorrect");
      error.code = 401; // unauthorized
      throw error;
    }
    // create a token
    const token = jwt.sign(
      { userId: existingUser._id.toString(), email: existingUser.email },
      "somesupersecretsecret",
      { expiresIn: "1h" } // expires in 1 hour
    );

    return {
      userId: existingUser._id.toString(),
      token: token,
      tokenExpiration: 1, // 1 hour
    };
  },

  /*
    1- check if the user is authenticated 
    2- validation 
    3- create new post & save it to the database
    4- add the post to the user and save the user
    5- return the created post
  */

  createPost: async (args, req) => {
    const { title, content, imageUrl } = args.postInput;
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401; // unauthorized
      throw error;
    }

    // Validate title, content, imageUrl
    validateField("title", title);
    validateField("content", content);

    const errors = [];

    if (validator.isEmpty(imageUrl)) {
      errors.push({
        message: "Image URL is required",
      });
    }

    if (errors.length > 0) {
      const error = new Error("invalid input");
      error.data = errors; // array of errors
      error.code = 422; // unprocessable entity
      throw error; // throw error to be caught by the error handler
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error("user not found");
      error.code = 401;
      throw error; // throw error to be caught by the error handler
    }

    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: user,
    });
    const createdPost = await post.save(); // this returned the created post

    user.posts.push(createdPost); // add the post to the user
    await user.save(); // save the user with the new post

    return {
      ...createdPost._doc,
      //convert id obj into string
      _id: createdPost._id.toString(),
      // overWrite created at & updated at
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  /*
  1- check if the user is authenticated
  2- pagination data 
  3- get all posts from the database 
  */
  posts: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401; // unauthorized
      throw error;
    }

    const currentPage = args.page || 1; // current page
    const perPage = 2; // posts per page
    const totalPosts = await Post.find().countDocuments(); // total posts

    const posts = await Post.find()
      .sort({ createdAt: -1 }) // sort by createdAt in descending order
      .skip((currentPage - 1) * perPage) // skip the posts of the previous pages
      .limit(perPage) // limit the number of posts to perPage
      .populate("creator"); // populate the creator field with the user data

    return {
      posts: posts.map((post) => {
        return {
          ...post._doc,
          _id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        };
      }),
      totalPosts: totalPosts,
    };
  },

  /*
  1- check if the user is authenticated
  2- get the post by id from the database & populate the creator field with the user data
  3- check if the post exists
  4- return the post
  */
  post: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401; // unauthorized
      throw error;
    }

    const postId = args.id;
    const post = await Post.findById(postId).populate("creator"); // populate the creator field with the user data

    if (!post) {
      const error = new Error("Post not found");
      error.code = 404; // not found
      throw error; // throw error to be caught by the error handler
    }

    return {
      ...post._doc,
      _id: post._id.toString(), //convert id obj into string because can't get objectId so convert it to string
      // overWrite created at & updated at
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },

  /*
    1- check if the user is authenticated
    2- get the post by id from the database
    3- check if the post exists
    4- check if the user is the creator of the post
    5- validate title, content
    6- update the post with the new data
    7- return the updated post
  */
  updatePost: async (args, req) => {
    console.log("updatePost", args, req);
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401; // unauthorized
      throw error;
    }

    const { title, content, imageUrl } = args.postInput;
    const postId = args.id;
    const post = await Post.findById(postId).populate("creator"); // populate the creator field with the user data
    if (!post) {
      const error = new Error("Post not found");
      error.code = 404; // not found
      throw error; // throw error to be caught by the error handler
    }
    // check user is creator of the post or not
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized to edit this post");
      error.code = 403; // forbidden
      throw error; // throw error to be caught by the error handler
    }

    // Validate title, content
    validateField("title", title);
    validateField("content", content);
    const errors = [];

    if (imageUrl !== "undefined") {
      // overWrite imageUrl if it is not undefined
      post.imageUrl = imageUrl;
    }

    // Update post
    post.title = title;
    post.content = content;
    post.updatedAt = new Date().toISOString();
    const updatedPost = await post.save(); // this returned the updated post
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(), //convert id obj into string
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },

  /*
  1- check if the user is authenticated
  2- get the post by id from the database
  3- check if the user is the creator of the post
  4- delete the post from the database , delete the image from the server, delete the post from the user
  5- return the deleted post
  */
  deletePost: async (args, req) => {
    if (!req.isAuth) {
      const error = new Error("Not authenticated");
      error.code = 401; // unauthorized
      throw error;
    }
    const postId = args.id;
    const post = await Post.findById(postId).populate("creator"); // populate the creator field with the user data
    if (!post) {
      const error = new Error("Post not found");
      error.code = 404; // not found
      throw error; // throw error to be caught by the error handler
    }
    // check user is creator of the post or not
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized to delete this post");
      error.code = 403; // forbidden
      throw error; // throw error to be caught by the error handler
    }

    // delete the image from the server
    // check if the imageUrl is not undefined before deleting it
    if (post.imageUrl !== "undefined") {
      clearImage(post.imageUrl); // delete the image from the server
    }
    // delete the post from the database
    const deletedPost = await Post.findByIdAndDelete(postId); // this returned the deleted post
    const user = await User.findById(req.userId); // get the user who created the post
    user.posts.pull(postId); // remove the post from the user
    await user.save(); // save the user with the new post

    return true; // return true if the post is deleted successfully
  },
};
