// controllers/authController.js
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const { validationResult } = require("express-validator");
const generateToken = require("../utils/generateToken");

// Register a new user
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Utilisateur déjà enregistré" });
    }
    user = new User({ username, email, password });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'inscription", error: error.message });
  }
};

// Connecting an existing user
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect" });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la connexion", error: error.message });
  }
};

// Edit password
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user || !(await user.matchPassword(oldPassword))) {
      return res.status(401).json({ message: "Old password incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password successfully updated" });
  } catch (error) {
    res.status(500).json({
      message: "Error while updating password",
      error: error.message,
    });
  }
};

// Update user status
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["online", "offline", "busy", "away"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    user.status = status;
    await user.save();
    res.status(200).json({ message: "Statut mis à jour", status: user.status });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du statut",
      error: error.message,
    });
  }
};