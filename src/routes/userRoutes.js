"use strict"

const express = require("express");
const { register, login } = require("../controllers/userController");
const router = express.Router();
const { 
    getIngredientDetails, 
    getDashboard, 
    getRecipeDetails
} = require('../controllers/appController');


router.get("/login", login);
router.post("/register", register);
router.get('/ingredient-detail', getIngredientDetails);
router.get('/dashboard', getDashboard);
router.get('/recipe-detail', getRecipeDetails);

module.exports = router;


