const path = require("path"); // Import the path module for handling file and directory paths
const fs = require("fs"); // Import the file system module for file operations
// Import the Express framework for building web applications
const express = require("express");
// Import the body-parser middleware for parsing request bodies
const bodyParser = require("body-parser");
const multer = require("multer"); // Import the multer middleware for handling file uploads

// import the mongoose library for MongoDB object modeling
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth"); // Import the authentication middleware

// Create an instance of an Express application
const app = express();
const { clearImage } = require("./util/file"); // Import the clearImage function for deleting images
/*
Configure multer for file uploads
=> multer is a middleware for handling multipart/form-data, which is used for uploading files.
=> The diskStorage() method is used to configure the storage engine for multer.
=> It allows you to control the destination and filename of the uploaded files.
=> The destination option specifies the folder where the uploaded files will be stored.
=> The filename option specifies the name of the file after it is uploaded.
=> In this case, we are using the current date and time as a prefix for the filename to ensure uniqueness.
=> The original filename is appended to the date string.
=> The cb() function is a callback function that multer calls to indicate that the file has been processed.
=> The first argument is an error (if any), and the second argument is the destination or filename.
=> In this case, we are passing null for the error and the destination and filename as the second argument.
=> The multer middleware will then handle the file upload and store it in the specified location.
=> The uploaded files will be accessible in the "images" directory.
*/
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    // Set the filename for the uploaded file
    // : --> not allowed in the filename so we replace it with -
    cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Check the file type and allow only images (jpg, jpeg, png)
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    cb(null, true); // Accept the file
  } else {
    cb(null, false); // Reject the file
  }
};
/* Parse incoming JSON requests and put the parsed data in req.body
The urlencoded() method is used to parse URL-encoded data 
(usually from HTML form submissions with application/x-www-form-urlencoded content type).
(e.g., name=John&age=30)
==> we don't need this for now we don't use form data we will use json data instead 
app.use(bodyParser.urlencoded());
*/
// register the multer middleware for handling file uploads
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")); // Handle single file uploads with the field name "image"
app.use(bodyParser.json()); // Parse incoming JSON requests and put the parsed data in req.body

app.use("/images", express.static(path.join(__dirname, "images"))); // Serve static files from the "images" directory
/*
before forward the requests to the routes
=> add headers to allow cross-origin requests
an Express.js middleware that sets up CORS (Cross-Origin Resource Sharing) headers to allow cross-origin HTTP requests
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH , DELETE"); // Allow specific HTTP methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers in requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next(); // Call the next middleware or route handler
});
/*
this middleware will run for every request that reaches graphql endpoint
but not denies the request if the user is not authenticated
all what it does is --> isAuth: false 
then in resolver we decide to continue or not 
*/
app.use(auth);

// Define the GraphQL endpoint for handling image uploads with put request
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    // If the user is not authenticated, return an error response
    return res.status(401).json({ message: "Not authenticated" });
  }
  // If the user is authenticated, proceed with the image upload
  if (!req.file) {
    // If no file is provided, return an error response
    return res.status(200).json({ message: "No file provided" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath); // delete the old image if it exists
  }
  // If a file is provided, return a success response with the file path
  return res.status(201).json({ message: "File stored", filePath: req.file.path });
});

/*
we use app.use instead of app.post because we want to handle all the requests
--> no routes , we only have one endpoint 
*/
app.use(
  "/graphql",
  graphqlHTTP({
    /*
  configuration
  -> needs 2 items to work 
    1. schema: the schema of the GraphQL API
    2. rootValue --> points to resolver 
  */
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true, // Enable GraphiQL in the browser
    // format the error
    formatError: (err) => {
      /*
      original error will be set by express-graphql 
      if technical error like a missing character in query -> there will be no original error
      */
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || "An error occurred";
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    },
  })
);

// Error handling middleware to catch errors and send a response
app.use((error, req, res, next) => {
  // Set the response status code to the error's status code or 500 if not set
  const status = error.statusCode || 500;
  const message = error.message || "An error occurred!";
  const data = error.data || null; // Get the error data if available
  // Set the response content type to JSON
  res.setHeader("Content-Type", "application/json");
  // Send the error response with the status code and error message
  res.status(status).json({ message: message, data: data });
});

// Connect to MongoDB using Mongoose
mongoose
  .connect("mongodb+srv://howaidasayed95:1751995@firstapi.7v1ba.mongodb.net", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
// Define the port number the server will listen on
