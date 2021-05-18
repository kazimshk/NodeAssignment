const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  postedByName: {
    type: String
  }
},
{
  timestamps: true,
});

module.exports = mongoose.model("posts", postsSchema);
