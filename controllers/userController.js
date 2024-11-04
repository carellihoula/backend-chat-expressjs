// controllers/userController.js

const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const { validationResult } = require("express-validator");

// Récupérer le profil de l'utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("friends", "username avatar status");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du profil",
      error: error.message,
    });
  }
};
// Retrieve all users from DB
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email avatar status");
    if (!users.length) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};

// Mettre à jour le profil de l'utilisateur
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, avatar } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    user.username = username || user.username;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;
    await user.save();
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du profil",
      error: error.message,
    });
  }
};

// Envoyer une demande d'ami
exports.sendFriendRequest = async (req, res) => {
  const { recipientId } = req.body;
  try {
    if (req.user.id === recipientId) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas vous ajouter vous-même" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res
        .status(404)
        .json({ message: "Utilisateur destinataire non trouvé" });
    }

    // Vérifier si une demande existe déjà
    const existingRequest = await FriendRequest.findOne({
      requester: req.user.id,
      recipient: recipientId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Demande d'ami déjà envoyée" });
    }

    // Vérifier si les utilisateurs sont déjà amis
    const isFriend = recipient.friends.includes(req.user.id);
    if (isFriend) {
      return res.status(400).json({ message: "Vous êtes déjà amis" });
    }

    const friendRequest = new FriendRequest({
      requester: req.user.id,
      recipient: recipientId,
    });
    await friendRequest.save();

    // Ajouter la demande à la liste des demandes de l'utilisateur destinataire
    recipient.friendRequests.push(friendRequest._id);
    await recipient.save();

    res.status(201).json({ message: "Demande d'ami envoyée", friendRequest });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'envoi de la demande d'ami",
      error: error.message,
    });
  }
};

// Accepter une demande d'ami
exports.acceptFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.status !== "pending") {
      return res
        .status(404)
        .json({ message: "Demande d'ami non trouvée ou déjà traitée" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Non autorisé à accepter cette demande" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Ajouter les utilisateurs à la liste des amis
    const requester = await User.findById(friendRequest.requester);
    const recipient = await User.findById(friendRequest.recipient);

    requester.friends.push(recipient._id);
    recipient.friends.push(requester._id);

    // Supprimer la demande d'ami
    recipient.friendRequests = recipient.friendRequests.filter(
      (id) => id.toString() !== requestId
    );

    await requester.save();
    await recipient.save();

    res.status(200).json({ message: "Ami ajouté avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'acceptation de la demande d'ami",
      error: error.message,
    });
  }
};

// Rejeter une demande d'ami
exports.rejectFriendRequest = async (req, res) => {
  const { requestId } = req.params;
  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest || friendRequest.status !== "pending") {
      return res
        .status(404)
        .json({ message: "Demande d'ami non trouvée ou déjà traitée" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Non autorisé à rejeter cette demande" });
    }

    friendRequest.status = "rejected";
    await friendRequest.save();

    // Supprimer la demande d'ami
    const recipient = await User.findById(friendRequest.recipient);
    recipient.friendRequests = recipient.friendRequests.filter(
      (id) => id.toString() !== requestId
    );
    await recipient.save();

    res.status(200).json({ message: "Demande d'ami rejetée" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du rejet de la demande d'ami",
      error: error.message,
    });
  }
};

// Rechercher un utilisateur par email
exports.searchUserByEmail = async (req, res) => {
  const emailQuery = req.query.email;
  if (!emailQuery) {
    return res.status(400).json({ message: "Email manquant dans la requête" });
  }
  try {
    const regex = new RegExp(emailQuery, "i"); // 'i' pour insensible à la casse
    const users = await User.find({ email: regex }).select("-password");
    if (!users.length) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé" });
    }
    res.json(users);
  } catch (error) {
    console.error("Erreur lors de la recherche de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les demandes d'ami
exports.getFriendRequests = async (req, res) => {
  try {
    const sentRequests = await FriendRequest.find({ requester: req.user.id })
      .populate("recipient", "username email avatar status")
      .exec();

    const receivedRequests = await FriendRequest.find({
      recipient: req.user.id,
    })
      .populate("requester", "username email avatar status")
      .exec();

    res.json({ sentRequests, receivedRequests });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'ami:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
