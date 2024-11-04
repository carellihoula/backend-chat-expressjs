// models/FriendRequest.js
const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending", // État par défaut
    },
  },
  {
    timestamps: true, // Ajoute des timestamps de création et de mise à jour
  }
);

module.exports = mongoose.model("FriendRequest", friendRequestSchema);
