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
// Connect to MongoDB using Mongoose
mongoose
  .connect(
    "mongodb+srv://howaidasayed95:1751995@restapi.7v1ba.mongodb.net/?retryWrites=true&w=majority&appName=firstapi",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    // Start the server and listen on the specified port
    // The callback function logs a message when the server starts successfully
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
// Define the port number the server will listen on
const PORT = 8080;
