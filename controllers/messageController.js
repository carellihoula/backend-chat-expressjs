// controllers/messageController.js
const Message = require("../models/MessageModel");

// @desc    Get messages between authenticated user and recipient
// @route   GET /api/messages/:recipientId
// @access  Private
const getMessages = async (req, res) => {
  const { recipientId } = req.params; // Récupère l'ID du destinataire depuis les paramètres de l'URL
  const userId = req.user._id; // ID de l'utilisateur authentifié

  try {
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    }).sort({ timestamp: 1 }); // Trier les messages par ordre croissant de timestamp

    res.json(messages);
  } catch (error) {
    console.error("Erreur serveur:", error);
    res
      .status(500)
      .json({ message: "Erreur serveur lors de la récupération des messages" });
  }
};

module.exports = { getMessages };
