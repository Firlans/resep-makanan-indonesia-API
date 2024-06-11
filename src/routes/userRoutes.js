"use strict"

const express = require("express");
const multer = require('multer');

const { upload } = require("../services/storage");
const {
  register,
  login,
  forgetPassword,
  editProfile,
  verifyEmail,
  getProfile,
  resetPassword,
  deleteAccount
} = require("../controllers/userController");
const {
    getIngredientsDetails,
    getDashboard,
    getRecipeDetails,
    createIngredient,
    getAllIngredients,
    createRecipe,
    getAllRecipes,
    updateIngredientData,
    deleteIngredient,
    deleteAllIngredientsData,
    updateRecipeData,
    deleteRecipe,
    deleteAllRecipesData
} = require('../controllers/appController');
const authorization = require("../services/auth");
const { getIngredients } = require("../services/storeData");

// konfigurasi multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// route
router.post("/login", login);
router.post("/register", register);
router.get("/verify-email", verifyEmail); // via email
router.get("/profile", authorization, getProfile);
router.post("/forget-password", forgetPassword);
router.post(
  "/profile/edit",
  authorization,
  avatarStore.upload.single("avatar"),
  editProfile
);
router.get("/reset-password", resetPassword); // via email
router.delete("user/delete-account", authorization, deleteAccount);

module.exports = router;


