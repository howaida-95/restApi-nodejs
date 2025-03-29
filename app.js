// Import the Express framework for building web applications
const express = require("express");
// Import the body-parser middleware for parsing request bodies
const bodyParser = require("body-parser");
// Import the feed routes from the routes directory
const feedRoutes = require("./routes/feed");

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
app.use("/feed", feedRoutes);
// Define the port number the server will listen on
const PORT = 8080;

// Start the server and listen on the specified port
// The callback function logs a message when the server starts successfully
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
