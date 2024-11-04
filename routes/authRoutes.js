const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  changePassword,
  updateStatus,
} = require("../controllers/authController");
const protect = require("../middleware/auth");

const router = express.Router();

// Routes d'authentification

// Inscription d'un nouvel utilisateur
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Nom d'utilisateur requis"),
    body("email").isEmail().withMessage("Email invalide"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Le mot de passe doit avoir au moins 6 caractères"),
  ],
  register
);

// Connexion d'un utilisateur existant
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email invalide"),
    body("password").notEmpty().withMessage("Mot de passe requis"),
  ],
  login
);

// Changer le mot de passe
router.post(
  "/change-password",
  protect,
  [
    body("oldPassword").notEmpty().withMessage("Ancien mot de passe requis"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Le nouveau mot de passe doit avoir au moins 6 caractères"),
  ],
  changePassword
);

// Mettre à jour le statut de l'utilisateur
router.post(
  "/status",
  protect,
  [body("status").notEmpty().withMessage("Statut requis")],
  updateStatus
);

module.exports = router;
