require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");
const User = require("./models/user");
const Post = require("./models/posts");
 var cache = require('memory-cache');
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
///// sockets//
const { Socket } = require('socket.io');
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

app.set("view engine", "ejs");
app.set("socketio",io);
app.set("cache",cache);
app.get("/feed", (req, res) => {
  res.render("feed");
});

//Database Connection for LocalHost
// mongoose.connect(process.env.DATABASE_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// const db = mongoose.connection;

mongoose.connect('mongodb+srv://admin:admin@socialnetwork.fbrje.mongodb.net/SocialNetwork?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useCreateIndex:true,
  useUnifiedTopology: true,
  useFindAndModify:false
});
const db = mongoose.connection;


//To check whether DB is connected or not
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to DataBase"));

app.use(express.json());

//Routes
app.use("/users", userRouter);
app.use("/posts", postRouter);

cache.put('socketid', 'kazim');
cache.put('socketid1', 'kazim1');


server.listen(3000, () => {
  console.log("server is running at 3000 port");
});


io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);


  const data1 = "hello World";
  socket.emit("newmessage", data1);
  socket.on("message", (data) => {
    //socket.broadcast.emit("message", data);
    socket.emit('message', data)
    console.log(data);

  });
});





















////////////////////////////////////////////
// const io = require('socket.io')(3000);
// const server = require('http').createServer(app);  
// //var io = require('socket.io')(server);
// const io = require("socket.io")(server, {
//   cors: {
//       origin: "http://localhost:3000",
//       methods: ["GET", "POST"]
//   }
// })
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

// // app.use(express.static(__dirname + '/node_modules'));  
// // app.get('/', function(req, res,next) {  
// //     res.sendFile(__dirname + '/index.html');
// // });

// // app.js

// // io.on('connection', function(client) {
// //   console.log('Client connected...');
// //   client.emit('check', (data)=> {
// //      console.log(data);
// //      client.emit('messages', 'Hello from server');
// //   });
// // }); 

// app.get('/', (req, res) => {
//   res.send('<h1>Hello world</h1>');
// });
