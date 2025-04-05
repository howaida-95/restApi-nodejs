const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/auth");
const { signup, login, forgotPassword, resetPassword } = authController;

// define authentication related routes
router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Please enter a valid email address."),
    body("password").trim().isLength({ min: 5 }).withMessage("Password must be at least 5 characters long."),
    body("name").trim().not().isEmpty().withMessage("Name is required."),
  ],
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email address."),
    body("password").trim().isLength({ min: 5 }).withMessage("Password must be at least 5 characters long."),
  ],
  login
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please enter a valid email address.")],
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [body("password").trim().isLength({ min: 5 }).withMessage("Password must be at least 5 characters long.")],
  resetPassword
);

module.exports = router;
