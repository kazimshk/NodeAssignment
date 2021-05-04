const io = require('socket.io')(8000);

const users = {};
//Socket
io.on('connection', socket =>{
    // console.log("new User");
    socket.on('new-user-joined', name=>{
      console.log('newuser ',name );
      users[socket.id]=name;
      socket.broadcast.emit('user-joined',name);
    })
   
    socket.on('send',message =>{
      socket.broadcast.emit('receive',{message: message, name: user[socket.id]});
    })
    // socket.emit('chat-message','hello world');
  });