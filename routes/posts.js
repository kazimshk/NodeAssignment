const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/posts");
const { count } = require("../models/posts");

//It will display all of the posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//it takes the params and do pagination
router.get("/pagination", async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const count =getCountOfPosts();
    const posts = await Post.find()
      .limit(limit * 1)
      .skip((page - 1) * limit);
    res.send(posts);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});
const getCountOfPosts= async function()
{
  const posts = await Post.find()
   for(count in posts){}
    console.log(count);
    return count;
  

}
//It takes the params of post and create a new post
router.post("/", async (req, res) => {
  const posts = new Post({
    title: req.body.title,
    desc: req.body.desc,
  });
  try {
    const newPost = await posts.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
