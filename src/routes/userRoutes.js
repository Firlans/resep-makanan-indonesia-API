"use strict"

const express = require("express");
const { register, login } = require("../controllers/userController");
const router = express.Router();
const { 
    getIngredientsDetails, 
    getDashboard, 
    getRecipeDetails,
    createIngredient,
    getAllIngredients,
    createRecipe
} = require('../controllers/appController');


router.get("/login", login);
router.post("/register", register);

//get all ingredients
router.get('/ingredients', getAllIngredients);

//ingredient details
router.get('/ingredient-detail', getIngredientsDetails);
router.post('/ingredient-detail-post', createIngredient);

router.get('/dashboard', getDashboard);

// recipe
router.post('/recipe-post', createRecipe);
router.get('/recipe-detail', getRecipeDetails);

module.exports = router;


