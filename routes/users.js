require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/posts");
const AuthToken = require("../middleware/Auth_Token");
const jwt = require("jsonwebtoken");
const { json } = require("express");
const { data } = require("jquery");
app.use(express.json());
const bcrypt = require("bcrypt");
const NodeCache = require("node-cache");
const myCache = new NodeCache();

//It will display all the users
router.get("/", AuthToken, async (req, res) => {
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
router.get("/:id/posts", AuthToken, async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("posts");
  if (user == null) {
    return res.status(404).send("There is no post");
  }
  console.log("user", user);
  const io = req.app.get("socketio");
  res.status(200).json(user.posts);
});

//It takes the users id and parameter of post and create a new post
//and then link the newly created post with that user
router.post("/:id/posts", AuthToken, async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  const newPost = new Post(req.body);
  let flag = "0";

  const user = await User.findById(userId);
  console.log("user: " + user);
  newPost.postedBy = user;
  await newPost.save();
  user.posts.push(newPost);
  await user.save();
  // const user = await User.findById(userId);
  if (myCache.has("usersId")) {
    console.log("Retrieved value from cache !!");
    const usersId = myCache.get("usersId");
    for (count in user.followers) {
      const follower_user = await User.findById(user.followers[count]);
      console.log(follower_user._id);
      if (usersId == follower_user._id) {
        console.log("return follower:" + follower_user._id);
        flag = "1";
      }
    }
  } else {
    console.log("No value in cache usersId !!");
  }
  if (flag === "1") {
    console.log("entered in flag");
    const io = req.app.get("socketio");
    io.sockets.emit("addpost", newPost);
  }
  res.status(201).json(newPost);
});

///'users/follower/following/'
// First param id will take the follower ID
//Second param will take the id of user which he wants to follow
router.post("/:id/:ids", AuthToken, async (req, res) => {
  const followerId = req.params.id;
  const followingId = req.params.ids;
  let flag = 1;
  console.log(followingId + "  " + followerId);

  const user = await User.findById(followingId);

  for (count in user.followers) {
    var follower_users = await User.findById(user.followers[count]);
    console.log(follower_users.id);
    if (follower_users.id == followerId) {
      flag = 0;
    }
  }
  if (flag == 0) {
    return res.status(403).send("That user is already following");
  }
  user.followers.push(followerId);
  await user.save();
  const followerUser = await User.findById(followerId);
  followerUser.following.push(followingId);
  await followerUser.save();
  res
    .status(201)
    .send(followerId + " is now successfully following " + followingId);
  //res.status(201).json(followerUser);
});

//display all the users who are following the given id
router.get(
  "/:id/followers",
  /*AuthToken,*/ async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("followers");
    console.log("user", user);
    res.status(200).json(user.followers);
  }
);

//Get user Id and Id of that user whom he wants to unfollow
router.put(
  "/:id/:idunfollow/unfollow",
  /*AuthToken,*/ async (req, res) => {
    const userId = req.params.id;
    const userIdunfollow = req.params.idunfollow;
    let flag = 0;
    const user = await User.findById(userId);
    for (count in user.following) {
      var following_users = await User.findById(user.following[count]);
      console.log(following_users.id);
      if (following_users.id == userIdunfollow) {
        flag = 1;
      }
    }
    if (flag == 0) {
      return res.status(404).send("That user is not following");
    }
    user.following.remove(userIdunfollow);

    const updated_user = await User.updateOne(
      { _id: req.params.id },
      {
        $set: { following: user.following },
      }
    );
    res.status(200).json("Successfully unfollowed the " + userIdunfollow);
  }
);

Array.prototype.remove = function () {
  var what,
    a = arguments,
    len = a.length,
    ax;
  while (len && this.length) {
    what = a[--len];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

//display all the users whom he is following
router.get(
  "/:id/following",
  /*AuthToken,*/ async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId).populate("following");
    console.log("user", user);

    res.status(200).json(user.following);
  }
);

router.get(
  "/:id/feed",
  /*AuthToken,*/ async (req, res) => {
    const userId = req.params.id;
    var postsArr = new Array();
    const user = await User.findById(userId);
    for (count in user.followers) {
      const follower_user = await User.findById(user.followers[count]);
      for (postData in follower_user.posts) {
        var posts = await Post.findById(follower_user.posts[postData]);
        try {
          postsArr.push(posts);
        } catch (err) {
          res.status(404).send(err);
        }
        console.log(postsArr);
      }
    }
    myCache.set("usersId", userId);
    console.log("Value set new");
    const io = req.app.get("socketio");
    io.sockets.emit("messagess", postsArr);
    res.send(postsArr);
  }
);

//It will display the feed sorted (most recent first)
router.get("/:id/feed/sorted", async (req, res) => {
  const userId = req.params.id;
  var postDates = new Array();
  const user = await User.findById(userId);
  for (count in user.followers) {
    const follower_user = await User.findById(user.followers[count]);
    for (postData in follower_user.posts) {
      var posts = await Post.findById(follower_user.posts[postData]);
      postDates.push(posts);
    }
  }
  postDates.sort(function (a, b) {
    return new Date(a.postDate) - new Date(b.postDate);
  });
  console.log("Posts data:" + postDates);
  res.status(200).send(postDates);
});

//It gets the id of user and display their result
router.get("/:id", async (req, res) => {
  try {
    user = await User.findById(req.params.id);
    if (user === null) {
      return res
        .status(404)
        .json({ message: "Cant find any User with this id" });
    }
    res.send(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//It takes the params of user and create a new user
router.post("/", async (req, res) => {
  try {
    const users = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    users.password = await bcrypt.hash(req.body.password, 4);
    const newUser = await users.save();
    res.status(201).json(newUser);
    res.send("USER REGISTERED SUCCESSFULLY");
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
router.put("/:id", AuthToken, async (req, res) => {
  try {
    const updated_user = await User.updateOne(
      { _id: req.params.id },
      {
        $set: { email: req.body.email },
      }
    );
    res.status(200).send("Successfully Updated");
  } catch (err) {
    res.json({ message: err });
  }
});

//It takes the id of user and then delete that user
router.delete("/:id", AuthToken, async (req, res) => {
  user = await User.findById(req.params.id);
  if (user === null) {
    res.status(404).json({ message: "Cant find any User with this id" });
  }
  try {
    const removed_user = await User.deleteOne({ _id: req.params.id });
    res.json(removed_user);
  } catch (err) {
    res.json({ message: err });
  }
});
//It takes the ID of user and returns with the jwt token for authentication
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
//It takes the Id of user and gets the token in Authorization and then Authorize the user to login
router.get(
  "/:id/login",
  /*AuthToken,*/ async (req, res) => {
    const userId = req.params.id;
    try {
      const password = req.body.password;
      console.log("here is the passsss: " + password);
      const foundUser = await User.findById(userId);
      // console.log(foundUser);
      if (!password) {
        return res
          .status(400)
          .json({ error: "please give the password as well" });
      }
      if (foundUser === null) {
        return res
          .status(404)
          .json({ message: "Cant find any User with this id" });
      } else {
        const isMatch = await bcrypt.compare(password, foundUser.password);
        const token = await foundUser.generateAuthToken();
        //console.log(token);
        if (!isMatch) {
          res.status(400).send({ error: "Password doesn't match" });
        } else {
          res.send({
            message:
              "user sign in successfully and here is the token to use for Auth: " +
              token,
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
