require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const userRouter = require("./routes/users");
const postRouter = require("./routes/posts");

//Database Connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

//To check whether DB is connected or not
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to DataBase"));

app.use(express.json());

//Routes
app.use("/users", userRouter);
app.use("/posts", postRouter);

app.listen(3000, () => {
  console.log("server is running at 3000 port");
});
