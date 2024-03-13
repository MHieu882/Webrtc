const activeUsers ={};
const Message = require('../models/MessageModel');
const User=require('../models/userModel');
const handleSocketEvents = (socket) => {
    socket.on('Login', (userLoggin) => {
        activeUsers[userLoggin] = socket.id;
        console.log(`User ${userLoggin} logged in.`);
    });
    socket.on('call', (data) => {
        const {target,caller,roomURL}=data;
        const targetSocketId=activeUsers[target];
        socket.to(targetSocketId).emit('receive',{roomURL,caller});
    });
    socket.on('decline',(data)=>{
        const {caller,callee}=data;
        const targetSocketId=activeUsers[caller];
        socket.to(targetSocketId).emit('decline',{callee});
    })
    socket.on('sendMessage', async(data)=>{
        const targetSocketId=activeUsers[data.usertarget];
        const message = new Message({ 
            sender: data.userLoggin, 
            receiver: data.usertarget, 
            content: data.message 
        });
        await message.save();
        socket.to(targetSocketId).emit('receiveMessage',{message});
    });
    socket.on('getMessage',async(data)=>{
        const{targetUser}=data;
        const getavt= await User.findOne({username:targetUser});
        const messages = await Message.find(
            {
              $or: [
                { receiver: targetUser },
                { sender: targetUser }
              ]
            },
            { sender: 1, content: 1,receiver:1, _id: 0 } // Chỉ lấy trường sender và content, bỏ qua trường _id
          ).sort({ timestamp: 1 });
        socket.emit('loadMess',{messages,targetUser,avat:getavt.avatar});
    });
    socket.on('deleteMessage',async(data)=>
    {
        const{targetUser,userLoggin}=data;
        await Message.deleteMany({ sender:userLoggin, receiver:targetUser })
        const messages = await Message.find(
            {
              $or: [
                { receiver: targetUser },
                { sender: targetUser }
              ]
            },
            { sender: 1, content: 1,receiver:1, _id: 0 } // Chỉ lấy trường sender và content, bỏ qua trường _id
          ).sort({ timestamp: 1 });
        socket.emit('loadMess',{messages,targetUser});
    });
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const userId = findUserIdBySocketId(socket.id);
        if (userId) {
            delete activeUsers[userId];
        }
    });
}
function findUserIdBySocketId(socketId) {
    for (const [userId, connectedSocketId] of Object.entries(activeUsers)) {
        if (connectedSocketId === socketId) {
            return userId;
        }
    }
    return null;
}

module.exports = { handleSocketEvents };