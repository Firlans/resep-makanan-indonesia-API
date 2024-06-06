"use strict"

const express = require("express");
const multer = require('multer');
const { register, login } = require("../controllers/userController");
const router = express.Router();
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
const { getIngredients } = require("../services/storeData");

// konfigurasi multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/login", login);
router.post("/register", register);

// routes for ingredients
router.get('/ingredients', getAllIngredients);
router.get('/ingredient/:id', getIngredientsDetails);
router.post('/ingredient-detail-post', upload.single('image'), createIngredient); // Middleware multer untuk single image upload
router.put('/ingredient-update', upload.single('image'), updateIngredientData);
router.delete('/ingredient-delete', deleteIngredient);
router.delete('/ingredient-deleteAll', deleteAllIngredientsData);

// mengambil data dashboard
router.get('/dashboard', getDashboard);

// routes for recipe
router.post('/recipe-post', createRecipe);
router.get('/recipe-detail', getRecipeDetails);
router.get('/all-recipes', getAllRecipes);
router.put('/recipe-update', updateRecipeData);
router.delete('/recipe-delete', deleteRecipe);
router.delete('/recipe-delete', deleteAllRecipesData);

module.exports = router;

