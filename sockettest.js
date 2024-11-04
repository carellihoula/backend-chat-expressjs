// testSocket.js
const { io } = require("socket.io-client");

const SOCKET_URL = "http://localhost:3000"; // Port de votre serveur Express

const token = "VOTRE_TOKEN_JWT"; // Remplacez par un token valide si nécessaire

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connecté au serveur Socket.IO");
});

socket.on("receiveMessage", (message) => {
  console.log("Message reçu:", message);
});

socket.on("disconnect", () => {
  console.log("Déconnecté du serveur Socket.IO");
});

socket.on("connect_error", (err) => {
  console.error("Erreur de connexion:", err.message);
});
