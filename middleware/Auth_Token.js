require("dotenv").config();
const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const user = require("../models/user");
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const Token = authHeader && authHeader.split(" ")[1];
  console.log(Token);
  //console.log(process.env.ACCESS_TOKEN_SECRET);
  if (Token === null) return res.sendStatus(401);
  console.log("usr token: "+process.env.ACCESS_TOKEN_SECRET);
  jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
