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
    deleteAllRecipesData,
    getRecipesByIngredient,
    getIngredientsByName,
    getRecipesByName
} = require('../controllers/appController');

// konfigurasi multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/login", login);
router.post("/register", register);

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

