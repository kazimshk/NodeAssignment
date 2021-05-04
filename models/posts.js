const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postsSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    desc : {
        type: String,
        required: true
    },
    // postDate : {
    //     type: Date,
    //     required: true,
    //     default: Date.now
    // },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref : 'user'
    }
},{
    timestamps: true
});

module.exports = mongoose.model('posts', postsSchema);