// Import the Express framework for building web applications
const express = require("express");
// Import the feed routes from the routes directory
const feedRoutes = require("./routes/feed");

// Create an instance of an Express application
const app = express();

app.use("/feed", feedRoutes);
// Define the port number the server will listen on
const PORT = 8080;

// Start the server and listen on the specified port
// The callback function logs a message when the server starts successfully
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
