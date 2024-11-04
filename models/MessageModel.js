// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now, // Date par défaut à la création du message
    },
  },
  {
    timestamps: true, // Ajoute des timestamps de création et de mise à jour
  }
);

module.exports = mongoose.model("Message", messageSchema);
