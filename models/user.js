const mongoose = require("mongoose");
const { Schema } = mongoose;
/*
newschema 
define how a user should look like in the database
*/
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I am new!",
  },
  /* link between posts & user */
  posts: [
    {
      type: Schema.Types.ObjectId, // reference to the post model
      ref: "Post", // linked to a post
    },
  ],
});
/*
this will create a collection called posts in the database
*/
module.exports = mongoose.model("User", userSchema);
