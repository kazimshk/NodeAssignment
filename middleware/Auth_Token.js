require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());


function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const Token = authHeader && authHeader.split(" ")[1];
  if (Token === null) return res.sendStatus(401);
  jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      return res.status(401).send("User Unathorized");
    }
    else {
      req.user = data;
      next();
    }
  });
}

module.exports = authenticateToken;
