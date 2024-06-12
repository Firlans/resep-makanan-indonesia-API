"use strict"

const express = require("express");
const multer = require('multer');

const avatarStore = require("../services/storage");
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
    deleteAllRecipesData,
    getRecipesByIngredient,
    getIngredientsByName,
    getRecipesByName
} = require('../controllers/appController');
const authorization = require("../services/auth");

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
router.delete("/delete-account", authorization, deleteAccount);

// routes for ingredients
router.get('/ingredients', getAllIngredients);
router.get('/ingredient/:id', getIngredientsDetails);
router.post('/ingredient-detail-post', upload.single('image'), createIngredient); // Middleware multer untuk single image upload
router.put('/ingredient-update/:id', upload.single('image'), updateIngredientData);
router.delete('/ingredient-delete/:id', deleteIngredient);
router.delete('/ingredient-deleteAll', deleteAllIngredientsData);

// mengambil data dashboard
router.get('/dashboard', getDashboard);

// routes for recipe
router.post('/recipe-post', createRecipe);
router.get('/recipe-detail/:id', getRecipeDetails);
router.get('/all-recipes', getAllRecipes);
router.put('/recipe-update/:id', updateRecipeData);
router.delete('/recipe-deleteId/:id', deleteRecipe);
router.delete('/recipe-delete', deleteAllRecipesData);

// route search / get recipes and ingredients by name
router.get('/recipes/name', getRecipesByName);
router.get('/ingredients/name', getIngredientsByName);

// routes for getting ingredients by name and recipes by ingredients
router.get('/recipes/by-ingredient', getRecipesByIngredient);
module.exports = router;


