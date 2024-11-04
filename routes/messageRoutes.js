// routes/messageRoutes.js
const express = require("express");
const { getMessages } = require("../controllers/messageController");
const protect = require("../middleware/auth");

const router = express.Router();

// Route pour obtenir les messages entre l'utilisateur connecté et un autre utilisateur
router.get("/:recipientId", protect, getMessages);

module.exports = router;
