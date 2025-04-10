const mongoose = require("mongoose");
const { Schema } = mongoose;
/*
newschema 
define how a post should look like in the database

*/
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    /* now there's a relation between post & user */
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User", // linked to a user
      required: true,
    },
    // creator: {
    //   type: Object,
    //   required: true,
    // },
  },
  {
    /* so mongoose will automatically add time when new post added
    so automatically it adds created at & updated at
    */
    timestamps: true,
  }
);
/*
this will create a collection called posts in the database
*/
module.exports = mongoose.model("Post", postSchema);
