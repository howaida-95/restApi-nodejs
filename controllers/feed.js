const { validationResult } = require("express-validator");

exports.getPosts = async (req, res, next) => {
  // send response
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post",
        imageUrl: "images/model1.png",
        creator: {
          name: "Omar",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = async (req, res, next) => {
  // handle errors
  const errors = validationResult(req); // check if there are any validation errors
  if (!errors.isEmpty()) {
    // 422 is the status code for unprocessable entity (validation error)
    // send error response
    return res.status(422).json({ message: "Validation failed, entered data is incorrect", errors: errors.array() });
  }
  // parse data from incoming request
  const title = req.body.title;
  const content = req.body.content;
  // validate data
  if (!title || !content) {
    // send error response
    return res.status(422).json({ message: "Invalid input" });
  }
  // save data to database (simulated here with a console log)
  // send response
  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: "Ahmed",
      },
      createdAt: new Date(),
    },
  });
};

/*
notes
======
no res.render(view)
because rest api returns json data not views
*/
