// routes/userRoutes.js

const express = require("express");
const {
  getProfile,
  updateProfile,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUserByEmail,
  getFriendRequests,
  getAllUsers,
} = require("../controllers/userController");
const protect = require("../middleware/auth");

const router = express.Router();

// Récupérer le profil de l'utilisateur
router.get("/profile", protect, getProfile);
//Retrieve all users from DB
router.get("/", getAllUsers);

// Mettre à jour le profil de l'utilisateur
router.put("/profile", protect, updateProfile);

// Envoyer une demande d'ami
router.post("/friend-request", protect, sendFriendRequest);

// Accepter une demande d'ami
router.put("/friend-request/accept/:requestId", protect, acceptFriendRequest);

// Rejeter une demande d'ami
router.put("/friend-request/reject/:requestId", protect, rejectFriendRequest);

// Rechercher un utilisateur par email
router.get("/search", protect, searchUserByEmail);

// Récupérer les demandes d'ami
router.get("/friendrequests", protect, getFriendRequests);

module.exports = router;
