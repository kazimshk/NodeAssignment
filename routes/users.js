require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/posts");
const AuthToken = require("../middleware/Auth_Token");
const jwt = require("jsonwebtoken");
app.use(express.json());

//IT will display all the users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

// It will display all the posts of a user
//It takes the user id
router.get("/:id/posts", async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("posts");
  console.log("user", user);
  res.status(200).json(user.posts);
});

//It takes the users id and parameter of post and create a new post
//and then link the newly created post with that user
router.post("/:id/posts", async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  const newPost = new Post(req.body);

  const user = await User.findById(userId);
  newPost.postedBy = user;
  await newPost.save();
  // //
  // await newPost.save().then(newPost => {
  //     Post.findByIdAndUpdate(userId, {
  //       $push: { posts: newPost.id }
  //     })
  //       .then(() => {
  //         res.status(200);
  //       })
  //       .catch(err => {
  //         res.status(500).json({ message: err });
  //       })
  // //
  // });
  user.posts.push(newPost);
  await user.save();
  res.status(201).json(newPost);
});

///'users/follower/following/'
router.post("/:id/:ids", async (req, res) => {
  const followingId = req.params.id;
  const followerId = req.params.ids;
  console.log(followingId + "  " + followerId);

  const user = await User.findById(followingId);
  user.followers.push(followerId);
  await user.save();
  const followerUser = await User.findById(followerId);
  followerUser.following.push(followingId);
  await followerUser.save();
  res.status(201).json(user);
});

//display all the users who are following
router.get("/:id/followers", async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("followers");
  console.log("user", user);
  res.status(200).json(user.followers);
});

//display all the users who are following
router.get("/:id/following", async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("following");
  console.log("user", user);
  res.status(200).json(user.following);
});

//It will display all of the posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//It gets the id of user and display their result
router.get("/:id", async (req, res) => {
  try {
    user = await User.findById(req.params.id);
    if (user === null) {
      res.status(404).json({ message: "Cant find any User with this id" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  res.send(user);
});

//It takes the params of user and create a new user
router.post("/", async (req, res) => {
  const users = new User({
    name: req.body.name,
    email: req.body.email,
  });
  try {
    // const accessToken = users.generateAuthToken();
    // console.log(accessToken);
    const newUser = await users.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

//It takes the params of post and create a new post
router.post("/post", async (req, res) => {
  const posts = new Post({
    title: req.body.title,
    desc: req.body.desc,
  });
  //users.posts.push(all);
  try {
    const newPost = await posts.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

//It takes the user id and email param and update the email of that user
router.patch("/:id", async (req, res) => {
  try {
    const updated_user = await User.updateOne(
      { _id: req.params.id },
      {
        $set: { email: req.body.email },
      }
    );
    res.json(updated_user);
  } catch (err) {
    res.json({ message: err });
  }
});

//It takes the id of user and then delete that user
router.delete("/:id", async (req, res) => {
  try {
    const removed_user = await User.deleteOne({ _id: req.params.id });
    res.json(removed_user);
  } catch (err) {
    res.json({ message: err });
  }
});
router.get("/:id/get-token", async (req, res) => {
  try {
    user = await User.findById(req.params.id);
    if (user === null) {
      res.status(404).json({ message: "Cant find any user with this id" });
    } else {
      const accessToken = user.generateAuthToken();
      res.json(accessToken);
      console.log(accessToken);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id/login", AuthToken, async (req, res) => {
  try {
    user = await User.findById(req.params.id);
    if (user === null) {
      res.status(404).json({ message: "Cant find any User with this id" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  res.send(user);
});

module.exports = router;
