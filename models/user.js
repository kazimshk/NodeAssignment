require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postsSchema = require("./posts");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  joinigDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "posts",
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  ],
});

userSchema.methods.generateAuthToken = function () {
  console.log("env :" + process.env.ACCESS_TOKEN_SCERET);
  const token = jwt.sign(
    { _id: this._id },
    "c23409cjo23kj209hfd0jdsk203u0rj230rhi2ckj312" /*process.env.ACCESS_TOKEN_SCERET*/
  );
  console.log("env :" + process.env.ACCESS_TOKEN_SCERET);
  console.log("methods token:  " + token);
  return token;
};

module.exports = mongoose.model("user", userSchema);
