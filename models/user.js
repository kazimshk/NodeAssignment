require("dotenv").config();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postsSchema = require("./posts");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcrypt");
const posts = require("./posts");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true, //to remove the extra spaces
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Not a valid Email, Enter again");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cannot be a word Password. Try again");
        }
      },
    },

    token: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

userSchema.pre("deleteOne", { document: true }, async function (next) {
  const removed_posts = await posts.deleteMany({ postedBy: this._id });
  next();
});

userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.token;
  return userObj;
}

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    { user: this },
    process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }
  );
  this.token = token;
  await this.save();
  return token;
};

module.exports = mongoose.model("user", userSchema);
