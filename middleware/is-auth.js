const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Extract token from Authorization header: "Bearer <token>"
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1]; // Get the token part (bearer + space + token)
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, "somesupersecretsecret");

    // Optionally, attach decoded payload to request object
    req.userId = decoded?.userId;

    // Proceed to next middleware/controller
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
