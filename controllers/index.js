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

var io= socket(server);
io.on("connection",function(socket){
    console.log('User connected:'+ socket.id)

    socket.on("join",function(roomName){
        var rooms = io.sockets.adapter.rooms;
        var room = rooms.get(roomName);
        if(room == undefined){
            socket.join(roomName);
            socket.emit("created");
        }
        else if(room.size == 1){
            socket.join(roomName);
            console.log("user join: "+roomName)
            socket.emit("joined")
        }
        else{
            socket.emit("full")
        }
    });

    socket.on("ready", function(roomName){
        socket.to(roomName).emit("ready",roomName);
    });

    socket.on("candidate", function(candidate, roomName){
        socket.to(roomName).emit("candidate",candidate);
    });

    socket.on("offer", function(offer,roomName){
        socket.to(roomName).emit("offer", offer);
    });

    socket.on("answer", function(answer, roomName){
        socket.to(roomName).emit("answer",answer);
    })
});