const express = require("express");
const http = require("http");
const socketIO = require("./socketIO"); // Importation correcte du fichier socketIO
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/public", express.static("public"));

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend React
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB
connectDB();

// Utilisation des routes utilisateur
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Créer le serveur HTTP
const server = http.createServer(app);

// Initialiser Socket.IO
socketIO(server);

// Importer les tâches planifiées
require("./scheduledTasks");

// Lancer le serveur
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
