const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/MessageModel");
const User = require("./models/User");

const socketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  let connectedUsers = {};

  // Middleware to check the JWT token during connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // Retrieve the token sent by the customer

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); //check  JWT token
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new Error("Authentication error: user not found"));
      }
      socket.user = user; // Attach user to socket
      next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`Utilisateur connecté: ${socket.user.id}`);
    const userId = socket.user.id;
    connectedUsers[userId] = socket.user; //add a user to userList
    //console.log(Object.values(connectedUsers));
    //Publish updated list of connected users

    // Send both lists in a single object
    await emitUserLists();

    //io.emit("userList", Object.values(connectedUsers));

    console.log(`Utilisateur connecté: ${userId}`);
    // Join the user to a room based on his ID
    socket.join(socket.user.id);

    // Récupérer et envoyer l'historique des messages à l'utilisateur connecté
    try {
      const messageHistory = await Message.find({
        $or: [{ senderId: userId }, { recipientId: userId }],
      }).sort({ timestamp: 1 });

      socket.emit("messageHistory", messageHistory); // Envoyer l'historique au client
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique des messages:",
        error
      );
    }

    // Listen to message events
    socket.on("sendMessage", async ({ recipientId, content }) => {
      try {
        // Create and save the message in MongoDB
        const message = new Message({
          senderId: socket.user.id, // Use authenticated user ID
          recipientId: recipientId,
          content,
        });

        await message.save();

        // Send message to recipient if connected
        io.to(recipientId).emit("receiveMessage", {
          _id: message._id,
          senderId: message.senderId || socket.user.id,
          recipientId: message.recipientId,
          content: message.content,
          timestamp: message.timestamp,
        });

        // Confirmation de l'envoi au sender
        socket.emit("messageSent", {
          _id: message._id,
          recipientId: recipientId,
          senderId: message.senderId,
          content: message.content,
          timestamp: message.timestamp,
        });
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        socket.emit("errorMessage", { error: "Message non envoyé" });
      }
    });

    socket.on("disconnect", async () => {
      delete connectedUsers[userId]; // Remove user from connected users list
      await emitUserLists(); // Diffuser la liste mise à jour des utilisateurs
      console.log(`Utilisateur déconnecté de la liste: ${userId}`);
      console.log(`Utilisateur déconnecté: ${socket.user.id}`);
    });
  });

  // Function to emit both lists in a single object
  async function emitUserLists() {
    try {
      // Fetch all users from the database
      const allUsers = await User.find().select("-password");
      const allUsersList = allUsers.map((user) => ({
        ...user.toObject(),
        status: false,
      }));

      // Prepare a list of connected users with their status set to online
      const connectedUsersList = Object.values(connectedUsers).map((user) => ({
        ...user.toObject(),
        status: true,
      }));

      // Mark users as online in the all users list if they are connected
      allUsersList.forEach((user) => {
        if (connectedUsers[user._id]) {
          user.status = true;
        }
      });

      // Emit both lists in a single object
      io.emit("userList", {
        allUsers: allUsersList,
        connectedUsers: connectedUsersList,
      });
    } catch (error) {
      console.error("Error emitting user lists:", error);
    }
  }
};

module.exports = socketIO;
