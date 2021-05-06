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

userSchema.pre("deleteOne", async function (next) {
  await posts.deleteMany({
    postedBy: this.id,
  });
  console.log("remove working");
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign(
    { _id: this._id },
    "c23409cjo23kj209hfd0jdsk203u0rj230rhi2ckj312" /*process.env.ACCESS_TOKEN_SCERET*/
  );
  this.token = token;
  await this.save();
  console.log("env :" + process.env.ACCESS_TOKEN_SCERET);
  console.log("methods token:  " + token);
  return token;
};

module.exports = mongoose.model("user", userSchema);
