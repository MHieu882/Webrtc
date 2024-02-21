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
let OnlineUser = {};

var io= socket(server);
io.on("connection",(socket)=>{
    socket.on('Login', (userLoggin) => {
        OnlineUser[userLoggin] = socket.id;
        console.log(`User ${userLoggin} logged in.`);
    });
       // Người gọi gửi offer cho người được gọi
    socket.on('offer',(data)=>{
        const {targetUserId,offer}=data;
        const targetSocketId=OnlineUser[targetUserId];
        //da co offer
        io.to(targetSocketId).emit('offer',{offer});
    });
     // Người được gọi gửi answer cho người gọi
    socket.on('answer', (data) => {
        const { targetUserId, answer } = data;
        io.to(targetUserId).emit('answer', { answer });
    });
     // Cả hai đối tác truyền ice candidate cho nhau
     socket.on('icecandidate', (data) => {
        const { targetUserId, candidate } = data;
        io.to(targetUserId).emit('icecandidate', { candidate });
    });
     // Ngắt kết nối khi người dùng thoát trình duyệt
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const userId = findUserIdBySocketId(socket.id);
        if (userId) {
            delete OnlineUser[userId];
        }
    });
   
});
function findUserIdBySocketId(socketId) {
    for (const [userId, connectedSocketId] of Object.entries(OnlineUser)) {
        if (connectedSocketId === socketId) {
            return userId;
        }
    }
    return null;
}
