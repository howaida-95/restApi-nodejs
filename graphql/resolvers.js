// import mongoose user model
const User = require("../models/User");
// to hash the password
const bcrypt = require("bcryptjs");

module.exports = {
  //   hello() {
  //     return {
  //       text: "hello world",
  //       views: 124,
  //     };
  //   },

  createUser: async (args, req) => {
    const { email, name, password } = args.userInput;
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
