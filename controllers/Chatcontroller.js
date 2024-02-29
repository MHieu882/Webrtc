const Message = require('../models/MessageModell');

const ChatController = {
  async getMessages(targetUser) {
    try {
      const messages = await Message.find({
        $or: [
          { receiver: targetUser },
          { sender: targetUser }
        ]
      });
      return messages;
    } catch (error) {
      console.error('Error retrieving messages:', error);
      throw error;
    }
  }
};

module.exports = { ChatController };
