const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Extract token from Authorization header: "Bearer <token>"
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      req.isAuth = false; // No token provided
      return next();
    }

    const token = authHeader.split(" ")[1]; // Get the token part (bearer + space + token)
    if (!token) {
      req.isAuth = false; // No token provided
      return next();
    }

    // Verify the token
    const decoded = jwt.verify(token, "somesupersecretsecret");

    // Optionally, attach decoded payload to request object
    req.userId = decoded?.userId;
    req.isAuth = true; // No token provided

    // Proceed to next middleware/controller
    next();
  } catch (err) {
    req.isAuth = false; // No token provided
    return next();
  }
};
