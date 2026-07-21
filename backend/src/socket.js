const { Server } = require('socket.io');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const onlineUsers = new Map(); // userId -> socketId

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // 1. User Online Registration
    socket.on('register_user', (userId) => {
      if (userId) {
        onlineUsers.set(userId.toString(), socket.id);
        socket.userId = userId.toString();
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });

    // 2. Join Conversation Room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(conversationId.toString());
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId.toString());
      }
    });

    // 3. Send Message Event (Real-Time + DB Storage)
    socket.on('send_message', async (data) => {
      try {
        const { conversation_id, sender_id, receiver_id, text } = data;
        if (!conversation_id || !sender_id || !receiver_id || !text) return;

        const msg = await Message.create({
          conversation_id,
          sender: sender_id,
          receiver: receiver_id,
          text: text.trim(),
          created_at: new Date(),
        });

        // Update conversation summary
        const conv = await Conversation.findById(conversation_id);
        if (conv) {
          conv.last_message = text.trim();
          conv.last_message_at = new Date();
          const currentUnread = conv.unread_count.get(receiver_id.toString()) || 0;
          conv.unread_count.set(receiver_id.toString(), currentUnread + 1);
          await conv.save();
        }

        const populatedMsg = await Message.findById(msg._id)
          .populate('sender', 'full_name email profile_image_url')
          .populate('receiver', 'full_name email profile_image_url');

        // Emit to room (instantly updates sender & receiver UI)
        io.to(conversation_id.toString()).emit('receive_message', populatedMsg);

        // Notify recipient if online
        const receiverSocketId = onlineUsers.get(receiver_id.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('conversation_updated', {
            conversation_id,
            last_message: text.trim(),
            last_message_at: new Date(),
          });
        }
      } catch (err) {
        console.error('Socket message error:', err.message);
      }
    });

    // 4. Typing Indicator
    socket.on('typing', ({ conversation_id, user_name }) => {
      socket.to(conversation_id.toString()).emit('user_typing', { user_name });
    });

    socket.on('stop_typing', ({ conversation_id }) => {
      socket.to(conversation_id.toString()).emit('user_stop_typing');
    });

    // 5. WebRTC Voice & Video Signaling Events
    socket.on('call_user', ({ user_to_call, signal_data, from_user, conversation_id, is_video }) => {
      const targetSocketId = onlineUsers.get(user_to_call.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('incoming_call', {
          signal_data,
          from_user,
          conversation_id,
          is_video,
        });
      }
    });

    socket.on('answer_call', ({ to_user, signal_data }) => {
      const targetSocketId = onlineUsers.get(to_user.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('call_accepted', { signal_data });
      }
    });

    socket.on('ice_candidate', ({ to_user, candidate }) => {
      const targetSocketId = onlineUsers.get(to_user.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('ice_candidate', { candidate });
      }
    });

    socket.on('end_call', ({ to_user }) => {
      const targetSocketId = onlineUsers.get(to_user.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('call_ended');
      }
    });

    socket.on('reject_call', ({ to_user }) => {
      const targetSocketId = onlineUsers.get(to_user.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('call_rejected');
      }
    });

    // 6. Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
      }
    });
  });

  return io;
}

module.exports = { initSocket, onlineUsers };
