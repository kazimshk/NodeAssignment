require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
var cache = require("memory-cache");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
///// sockets//
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");
app.set("socketio", io);
app.set("myCache", myCache);
app.get("/feed", (req, res) => {
  res.render("feed");
});


mongoose.connect(
  process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);
const db = mongoose.connection;

//To check whether DB is connected or not
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to DataBase"));

app.use(express.json());

//Routes
app.use("/users", userRouter);
app.use("/posts", postRouter);



server.listen(3000, () => {
  console.log("server is running at 3000 port");
});

const arr =new Array();
var socketObj= {
  socketid : 0,
  userid : 0
}

io.on("connection", (socket) => {
  console.log("User connected server: " + socket.id);

  let userSocket = JSON.parse(JSON.stringify(socketObj));
  userSocket.socketid = socket.id;
  arr.push(userSocket);
  myCache.set("sockets", arr);

});
