const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/posts");
const AuthToken = require("../middleware/Auth_Token");


//Get Posts of a user
router.get("/posts", AuthToken, async (req, res) => {
  const user = req.user.user;
  const userId = user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  try {
    const post = await Post
      .find({ postedBy: userId })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    if (post === null) {
      res.status(404).send("Post Not Found");
    } else {
      res.status(200).send(post);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//New Post Route
router.post("/newpost", AuthToken, async (req, res) => {
  const authUser = req.user.user;
  const userId = authUser._id;
  const newPost = new Post(req.body);
  let existingFollowers;

  const user = await User.findById(userId);
  newPost.postedBy = user;
  await newPost.save();
  user.posts.push(newPost);
  await user.save();

  const myCache = req.app.get("myCache");
  if (myCache.has("userId")) {
    const usersId = myCache.get("userId");
    existingFollowers = user.followers.some((currentFollowers) => { //Check whether that user is a follower or not
      return currentFollowers._id == usersId;
    });
    if (existingFollowers) {
      const io = req.app.get("socketio");
      const socketId = myCache.get("socketId");
      io.to(socketId).emit("addpost", newPost);
    }
  }
  res.status(201).send(newPost);
}
);
//Update post Route
//It takes the title of post and update the description 
router.patch("/update", AuthToken, async (req, res) => {
  try {
    const user = req.user.user;
    const userId = user._id;
    const postTitle = req.body.title;
    const updated_post = await Post.updateOne(
      { $and: [{ postedBy: userId }, { title: postTitle }] },
      {
        $set: { desc: req.body.desc },
      }
    );
    if (updated_post.nModified === 1) {
      return res.status(200).send("Successfully Updated");
    } else {
      return res.status(200).send("Not updated");
    }
  } catch (err) {
    res.send({ message: err });
  }
});

//Delete post Route
// it takes the title of post and delete it
router.delete("/post", AuthToken, async (req, res) => {
  try {
    const user = req.user.user;
    const userId = user._id;
    const postTitle = req.body.title;
    const deleted_post = await Post.deleteOne(
      { $and: [{ postedBy: userId }, { title: postTitle }] });
    if (deleted_post.deletedCount === 1) {
      return res.status(200).send("Successfully Deleted");
    } else {
      return res.status(200).send("Not Deleted");
    }
  } catch (err) {
    res.send({ message: err });
  }
});


//Get All Posts Route
router.get("/", AuthToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    console.log(page + " " + limit);
    const posts = await Post.find()
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.send(posts);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

//View Single Post
router.get("/post", AuthToken, async (req, res) => {

  const user = req.user.user;
  const userId = user._id;
  const postTitle = req.body.title;
  try {
    const post = await Post.find(
      { $and: [{ postedBy: userId }, { title: postTitle }] }
    );
    if (post === null) {
      res.status(404).send("Post Not Found");
    } else {
      res.status(200).send(post);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

router.get("/feed", AuthToken, async (req, res) => {
  const authUser = req.user.user;
  const userId = authUser._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const sortOrder = parseInt(req.query.sortOrder) || 1;     //1 for Asc, -1 for Desc
  const calLimit = (limit * 1);
  const calSkip = (page - 1) * limit;
  const result = await User.findOne({ _id: userId })
    .populate({
      path: "following",
      options: {
        select: { name: 1 },
        sort: { 'updatedAt': sortOrder },
        skip: calSkip,
        limit: calLimit
      },
      populate: {
        path: "posts",
        options: {
          select: { title:1, desc: 1 }
        }
      }
    })
    .select("name")
  res.send(result.following);
try { 
    const myCache = req.app.get("myCache");
    if (myCache.has("socketId")) {
      myCache.set("userId", userId);

      const socketId = myCache.get("socketId");
      const io = req.app.get("socketio");
      io.to(socketId).emit("messagess", result.following);
    } else {
      console.log("no socketId");
    }
  } catch (error) {
    return res.status(500).send(err);
  }
});

module.exports = router;