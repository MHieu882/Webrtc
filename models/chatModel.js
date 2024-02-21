const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    user1:{   },
    user
    
},
{ timestamps:true }
);

module.exports = mongoose.model('User',userSchema);