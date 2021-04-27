const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postsSchema = require('./posts');

// const postsSchema = new mongoose.Schema({
//     title : {
//         type: String,
//         required: true
//     }
//     // ,
//     // description : {
//     //     type: String,
//     //     required: true
//     // },
//     // postDate : {
//     //     type: Date,
//     //     required: true,
//     //     default: Date.now
//     // }
// })
// const posts = mongoose.model('post', postsSchema);

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    joinigDate : {
        type: Date,
        required: true,
        default: Date.now
    },
    posts :[{
        type: Schema.Types.ObjectId,
        ref: 'posts'
    }]
})

module.exports = mongoose.model('user', userSchema);