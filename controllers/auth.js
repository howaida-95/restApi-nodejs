const User = require("../models/user");
const { validationResult } = require("express-validator"); // for validating request data
const bcrypt = require("bcryptjs"); // for hashing passwords
// const jwt = require("jsonwebtoken"); // for generating JWT tokens
// const crypto = require("crypto"); // for generating random tokens
// const nodemailer = require("nodemailer"); // for sending emails

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the most relevant validation error
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect.");
      error.statusCode = 422; // Unprocessable Entity
      error.data = errors.array(); // Add validation errors to the error object(keeps track of the errors)
      throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    // Hash the password using bcrypt
    await bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          name: name,
        });
        return user.save(); // Save the user to the database
      })
      .then((result) => {
        res.status(201).json({ message: "User created successfully!", userId: result._id });
      })
      .catch(() => {
        const error = new Error("Failed to hash password.");
        error.statusCode = 500; // Internal Server Error
        throw error;
      }); // Hash the password with a salt round of 12
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500; // Internal Server Error
    }
    next(err); // Pass the error to the error handling middleware
  }
};
exports.login = async (req, res, next) => {};
