// import mongoose user model
const User = require("../models/User");
// to hash the password
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

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
};
