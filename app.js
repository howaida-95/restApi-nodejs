const path = require("path"); // Import the path module for handling file and directory paths
// Import the Express framework for building web applications
const express = require("express");
// Import the body-parser middleware for parsing request bodies
const bodyParser = require("body-parser");
// Import the feed routes from the routes directory
const feedRoutes = require("./routes/feed");
// import the mongoose library for MongoDB object modeling
const mongoose = require("mongoose");

// Create an instance of an Express application
const app = express();
/* Parse incoming JSON requests and put the parsed data in req.body
The urlencoded() method is used to parse URL-encoded data 
(usually from HTML form submissions with application/x-www-form-urlencoded content type).
(e.g., name=John&age=30)
==> we don't need this for now we don't use form data we will use json data instead 
app.use(bodyParser.urlencoded());
*/
app.use(bodyParser.json()); // Parse incoming JSON requests and put the parsed data in req.body
app.use("/images", express.static(path.join(__dirname, "images"))); // Serve static files from the "images" directory
/*
before forward the requests to the routes
=> add headers to allow cross-origin requests
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH , DELETE"); // Allow specific HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers in requests
  next(); // Call the next middleware or route handler
});
app.use("/feed", feedRoutes);

// Error handling middleware to catch errors and send a response
app.use((error, req, res, next) => {
  // Set the response status code to the error's status code or 500 if not set
  const status = error.statusCode || 500;
  // Set the response content type to JSON
  res.setHeader("Content-Type", "application/json");
  // Send the error response with the status code and error message
  res.status(status).json({ message: error.message });
});


// Connect to MongoDB using Mongoose
mongoose
  .connect("mongodb+srv://howaidasayed95:1751995@firstapi.7v1ba.mongodb.net", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // Start the server and listen on the specified port
    // The callback function logs a message when the server starts successfully
    const PORT = 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
// Define the port number the server will listen on
