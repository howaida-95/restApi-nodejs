exports.getPosts = async (req, res, next) => {
  // send response
  res.status(200).json({
    posts: [
      { title: "First Post", content: "This is the first post" },
      { title: "Second Post", content: "This is the second post" },
      { title: "Third Post", content: "This is the third post" },
    ],
  });
};

exports.createPost = async (req, res, next) => {
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
    post: { id: new Date().toISOString(), title, content },
  });
};

/*
notes
======
no res.render(view)
because rest api returns json data not views
*/
// 5:35
