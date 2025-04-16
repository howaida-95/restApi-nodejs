// import mongoose user model
const User = require("../models/User");
// to hash the password
const bcrypt = require("bcryptjs");
const validator = require("validator");

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
      throw error;// throw error to be caught by the error handler
    }

    // check if the user exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    /* create a new user
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
};
