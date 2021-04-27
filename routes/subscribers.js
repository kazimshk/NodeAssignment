const express = require('express');
const router = express.Router();
const Subscriber = require('../models/subscriber');


router.get('/', async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        res.json(subscribers);
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
        subs = await Subscriber.findById(req.params.id);
        if (subs === null) {
            res.status(404).json({ message: 'Cant find any subscribe with this id' })
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.send(subs);
})

router.post('/', async (req, res) => {
    const subscribers = new Subscriber({
        name: req.body.name,
        subscribedToChannel: req.body.subscribedToChannel
    })
    try {
        const newSubscriber = await subscribers.save();
        res.status(201).json(newSubscriber);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }

})


router.patch('/:id', (req, res) => {

})
//Deleting One
router.delete('/:id', async (req, res) => {
    try {
            const subs = await Subscriber.findById(req.params.id);
        if (subs === null) {
            res.status(404).json({ message: 'Cant find any subscribe with this id' })
        }
        else {
            console.log(subs);
            subs.then(()=>{Subscriber.remove()});
            res.json({ message: 'Successfully Deleted' });
        }
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.send(subs);

})

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