const socket = io('http://localhost:3000');

// socket.on('chat-message', data =>{
//     console.log(data);
// })

const a ={
    "name":"hello",
    "age":"23"
}
//const name = prompt("Enter your name");
socket.emit('new-user-joined',a);

socket.on('user-joined',name=>{
    console.log('server side :', name);
});