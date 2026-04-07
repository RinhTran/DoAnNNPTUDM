function registerChatSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_user", (userId) => {
      if (!userId) return;
      socket.join(userId);
      socket.userId = userId;
      console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = registerChatSocket;