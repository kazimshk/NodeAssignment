require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/posts");
const AuthToken = require("../middleware/Auth_Token");
const jwt = require("jsonwebtoken");
app.use(express.json());
const bcrypt = require("bcrypt");


//Signup Route
//It takes the params of user and create a new user
router.post("/signup", async (req, res) => {
  try {
    const users = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    users.password = await bcrypt.hash(req.body.password, 4);
    await users.save();
    const token = await users.generateAuthToken();
    return res.status(200).send(token);
  } catch (err) {
    return res.status(400).send({ message: err.message });
  }
});

//Login Route
//You can login by giving email and password and it will return the token
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (!email) {
      return res.status(400).send({ error: "Email missing" });
    }
    else if (!password) {
      return res.status(400).send({ error: "Password missing" });
    }
    else {
      const foundUser = await User.findOne({ email: email });
      if (foundUser === null) {
        return res.status(404).send({ message: "Cant find any User with this email" });
      } else {
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
          res.status(400).send({ error: "Password doesn't match" });
        } else {
          const token = await foundUser.generateAuthToken();
          res.status(200).send(token);
        }
      }
    }
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}
);

//Logout ROute
router.patch("/logout", AuthToken, async (req, res) => {
    const user = req.user.user;
    const userId = user._id;
    try {
      await User.findByIdAndUpdate(userId,
        { token: "" }, function (err, result) {
          if (error) {
            return res.status(500).send(error);
          } else {
            return res.status(200).send("Successfully Logout");
          }
        }
      );
  } catch (err) {
    res.send({ message: err });
  }
});

//It takes email as parameter and update the email of current user
router.patch("/", AuthToken, async (req, res) => {

  const user = req.user.user;
  const userId = user._id;
  try {
    await User.findByIdAndUpdate(userId,
      { email: req.body.email }, function (err, result) {
        if (error) {
          return res.status(500).send(error);
        } else {
          return res.status(200).send(result);
        }
      }
    );
  } catch (err) {
    res.status(500).send({ message: err });
  }
});

//Delete Route
router.delete("/", AuthToken, async (req, res) => {
  const user = req.user.user;
  const userId = user._id;
  if (userId === null) {
    return res.status(404).send({ message: "Cant find any User" });
  }
  try {
    await User.findById(userId ,function (err, result) {
      if (error) {
        res.status(500).send(error);
      }
      else{
         remove_user.deleteOne();
        return res.status(200).send(result);
      }
    });
  } catch (err) {
    res.status(500).send({ message: err });
  }
});


//FollowUser Router
router.post("/:id/follow", AuthToken, async (req, res) => {
  try {
    const authUser = req.user.user;
    const followerId = authUser._id;
    const followingId = req.params.id;
    const user = await User.findById(followingId);
    const existingFollowers = user.followers.some((currentFollowers) => {
      return currentFollowers._id == followerId;
    });
    if (existingFollowers) {
      return res.status(409).send("You are Already Following that user: " + user.name);
    } else {
      user.followers.push(followerId);
      await user.save();
      const followerUser = await User.findById(followerId);
      followerUser.following.push(followingId);
      await followerUser.save();
      return res.status(201).send("Successfully following " + user.name);
    }
  } catch (err) {
    return res.send(err);
  }
});


//Unfollow User Route
router.patch("/:idunfollow/unfollow", AuthToken, async (req, res) => {
  try {
    const authUser = req.user.user;
    const userId = authUser._id;
    const userIdunfollow = req.params.idunfollow;
    const user = await User.findById(userId);
    const userCountFollowing = user.following.indexOf(userIdunfollow);

    if (userCountFollowing === -1) {
      return res.status(404).send(userIdunfollow + " is not following");
    } else {
      const deleted = user.following.splice(userCountFollowing, 1);
      user.save();
      const userUnfollow = await User.findById(userIdunfollow);
      const userCountFollower = userUnfollow.followers.indexOf(userId);
      const deleted2 = userUnfollow.followers.splice(userCountFollower, 1);
      userUnfollow.save();
      return res.status(200).send("Successfully Unfollowed");
    }
  } catch (error) {
    res.status(500).send(err);
  }
});


///Follower Users Route
router.get("/followers", AuthToken, async (req, res) => {
  const authUser = req.user.user;
  const userId = authUser._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sortOrder = parseInt(req.query.sortOrder) || 1;     //1 for Asc, -1 for Desc
  const calLimit = (limit * 1);
  const calSkip = (page - 1) * limit;
  try {
    const result = await User.findOne({ _id: userId })
      .populate({
        path: "followers", select: { password: 0, createdAt: 0, updatedAt: 0, token: 0 },
        options: {
          sort: { 'createdAt': sortOrder },
          skip: calSkip,
          limit: calLimit
        }
      })
      .select("name")
    res.status(200).send(result.followers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});


//Following User Route
router.get("/following", AuthToken, async (req, res) => {
  const authUser = req.user.user;
  const userId = authUser._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sortOrder = parseInt(req.query.sortOrder) || 1;     //1 for Asc, -1 for Desc
  const calLimit = (limit * 1);
  const calSkip = (page - 1) * limit;
  try {
    const result = await User.findOne({ _id: userId })
      .populate({
        path: "following", select: { password: 0, createdAt: 0, updatedAt: 0, token: 0 },
        options: {
          sort: { 'createdAt': sortOrder },
          skip: calSkip,
          limit: calLimit
        }
      })
      .select("name")
    res.status(200).send(result.following);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

//User Profile Route
router.get("/profile", AuthToken, async (req, res) => {
  const authUser = req.user.user;
  const userId = authUser._id;
  try {
    user = await User.findById(userId);
    if (user === null) {
      return res
        .status(404)
        .send({ message: "Cant find any User with this id" });
    }
    res.send(user);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});




module.exports = router;
