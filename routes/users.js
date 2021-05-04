require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const User = require("../models/user");
const Post = require("../models/posts");
const AuthToken = require("../middleware/Auth_Token");
const jwt = require("jsonwebtoken");
const { json } = require("express");
app.use(express.json());
 //const socket = io('http://localhost:3000');

//It will display all the users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    // socket.emit('new-user-joined','helloworld');
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
  user.posts.push(newPost);
  await user.save();
  res.status(201).json(newPost);
});

///'users/follower/following/'
// First param id will take the follower ID
//Second param will take the id of user which he wants to follow
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


//display all the users who are following the given id
router.get("/:id/followers", async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("followers");
  console.log("user", user);
  res.status(200).json(user.followers);
});

//display all the users whom he is following
router.get("/:id/following", async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate("following");
  console.log("user", user);
  res.status(200).json(user.following);
});


//It will display the feed
router.get("/:id/feed", async (req, res) => {
    const userId = req.params.id;
    var allPosts= " ";
    const user = await User.findById(userId);//.populate("followers");
    for(data in user.followers){
            const follower_user=await User.findById(user.followers[data]);
            //console.log(follower_user.posts);
            for(postData in follower_user.posts){
                //console.log(follower_user.posts[postData]);
                var posts = await Post.findById(follower_user.posts[postData]);
                //res.status(200).json(posts);
                try {
                  //res.send(posts);
                  const jsonToStr = JSON.stringify(posts);
                  allPosts += ' '+jsonToStr; 
                } catch (err) {
                  res.status(404).send(err);
                }
                 console.log(allPosts);

                
              
            }
        //console.log(user.followers);
    }
    //const jsonPost = JSON.parse(allPosts);
   //console.log(typeof(jsonPost));
  // const aa = JSON.parse(allPosts);
  
  res.send(allPosts);

    //console.log("user", user);
   // res.status(200).json(user.followers);
   //res.status(200);
   
   //res.json(posts);
  });

//It will display the feed sorted (most recent first)
router.get("/:id/feed/sorted", async (req, res) => {
    const userId = req.params.id;
    var postDates = '';
    const user = await User.findById(userId);//.populate("followers");
    for(data in user.followers){
            const follower_user=await User.findById(user.followers[data]);
            //console.log(follower_user.posts);
            for(postData in follower_user.posts){
                //console.log(follower_user.posts[postData]);
                var posts = await Post.findById(follower_user.posts[postData]);
                //res.status(200).json(posts);
                //console.log(posts.postDate);
                postDates += ' '+posts.postDate;

                // router.route("/getDocuments").get(function(req, res) {
                //   detail
                //     .find({}, function(err, result) {
                //       if (err) {
                //         console.log(err);
                //       } else {
                //         res.json(result);
                //       }
                //     })
                //     .sort({ age: 1 });
                //});
            }
           // posts.postDate.sort( compare );
        //console.log(user.followers);
    }
    console.log(postDates);
  });

  function compare( a, b ) {
    if ( a.postDate < b.postDate ){
      return -1;
    }
    if ( a.postDate < b.postDate ){
      return 1;
    }
    return 0;
  }
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
  try {
  const users = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });
  
     const accessToken = users.generateAuthToken();
     console.log(accessToken);
     users.token= accessToken;
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
router.delete("/:id",AuthToken, async (req, res) => {
  user = await User.findById(req.params.id);
    if (user === null) {
      res.status(404).json({ message: "Cant find any User with this id" })
    };
  try{
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
