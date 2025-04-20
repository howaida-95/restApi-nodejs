const fs = require("fs"); // import the file system module to interact with the file system
const path = require("path"); // import the path module to work with file paths

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath); // join the directory name with the file path
  fs.unlink(filePath, (err) => {
    console.log(err); // log any error that occurs while deleting the file
  });
};
exports.clearImage = clearImage; // export the clearImage function for use in other modules
