const express = require('express');
const app= express();
const socket = require('socket.io');
require('dotenv').config();
const server = app.listen(3000,()=>{
    console.log('Server running');
})

const bodyParser= require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine','ejs');
app.set('/views','./views');

app.use(express.static('public'));

const userRoute=require('./routes/userRoute');

const  mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/webrtc-app');



app.use('/',userRoute);
//socket io workiong with signaling server

// Đối tượng lưu trữ các kết nối
const activeUsers ={};
var io= socket(server);
io.on('connection', (socket) => {
    // Handle login
    socket.on('login', (userLoggin) => {
        activeUsers[userLoggin] = socket.id;
        console.log(`User ${userLoggin} logged in.`);
    });
  

    socket.on('offer', (data) => {
      const {targetUserId,offer}=data;
      const targetSocketId=activeUsers[targetUserId];
      console.log(offer)
      //da co offer
      io.to(targetSocketId).emit('offer',{offer});
    });
  
    // Handle video answer
    socket.on('answer', (data) => {
      const { targetUserId, answer } = data;
        io.to(targetUserId).emit('answer', { answer });
    });
  
    // Handle ICE candidate
    socket.on('ice-candidate', (data) => {
      const { targetUserId, candidate } = data;
      io.to(targetUserId).emit('icecandidate', { candidate });
    })
  
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const userId = findUserIdBySocketId(socket.id);
        if (userId) {
            delete activeUsers[userId];
        }
    });
  });
function findUserIdBySocketId(socketId) {
    for (const [userId, connectedSocketId] of Object.entries(activeUsers)) {
        if (connectedSocketId === socketId) {
            return userId;
        }
    }
    return null;
}
