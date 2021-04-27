const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/posts');


router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
        //res.send("Hello World");
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
})

router.get('/:id/posts', async (req,res)=>{
    const  userId  = req.params.id;
    const user = await User.findById(userId).populate('posts');
    console.log('user', user);
    res.status(200).json(user.posts);

});

router.post('/:id/posts', async (req,res)=>{
    const  userId  = req.params.id;
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
    //console.log(user);
    await user.save();
    res.status(201).json(newPost);
    //console.log('newPost', newPost);
});

router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
        //res.send("Hello World");
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
})
router.get('/:id', async (req, res) => {
    // res.send(req.params.id);
    //let subscriber;
    try {
        user = await User.findById(req.params.id);
        if (user === null) {
            res.status(404).json({ message: 'Cant find any subscribe with this id' })
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.send(user);
})

router.post('/', async (req, res) => {
    const users = new User({
        name: req.body.name,
        email: req.body.email,
        posts: req.body.title
    })
    //users.posts.push(all);
    try {
        const newUser = await users.save();
        res.status(201).json(newUser);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }

})

router.post('/post', async (req, res) => {
    const posts = new Post({
        title: req.body.title,
        desc : req.body.desc
    })
    //users.posts.push(all);
    try {
        const newPost = await posts.save();
        res.status(201).json(newPost);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }

})


router.patch('/:id', async (req, res) => {
     try {
        const updated_user = await User.updateOne(
            { _id: req.params.id },
             { $set: 
                { email: req.body.email }
             });
        res.json(updated_user);
    }
    catch (err) {
        res.json({ message: err });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const removed_user = await User.deleteOne({ _id: req.params.id });
        res.json(removed_user);
    }
    catch (err) {
        res.json({ message: err });
    }
});

// //Deleting One
// router.delete('/:id', async (req, res) => {
//     try {
//             const subs = await Subscriber.findById(req.params.id);
//         if (subs === null) {
//             res.status(404).json({ message: 'Cant find any subscribe with this id' })
//         }
//         else {
//             console.log(subs);
//             subs.then(()=>{Subscriber.remove()});
//             res.json({ message: 'Successfully Deleted' });
//         }
//     }
//     catch (err) {
//         res.status(500).json({ message: err.message });
//     }
//     res.send(subs);

// })
//////////////
// async function getByIdSubs(req,res,next){                               //Custom Middleware
//     let subscriber;
//     try{
//         subs = await Subscriber.findById(req.params.id);
//         if(subs == null){
//             return res.status(404).json({message: 'Cant find any subscribe with this id'})
//         }
//     }
//     catch(err){
//         return res.status(500).json({message : err.message});
//     }
//     res.subscriber = subscriber;
//     next()
// }
module.exports = router;