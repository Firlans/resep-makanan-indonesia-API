const { getIngredients, getRecipeDetails, getRecipeById } = require('../services/storeData');

// function mengambil bahan
const getIngredientDetails = (req, res) => {
    const ingredientId = parseInt(req.query.id);
    const ingredient = getIngredientById(ingredientId);
    if (ingredient) {
        res.json ({
            status: 'success',
            message: 'Ingredient retrieved successfully',
            data: ingredient
        });
    } else {
        res.json ({
            status: 'fail',
            message: 'ingredients not found'
        });
    }
}

// function menampilkan dashboard
const getDashboard = (req, res) => {
    res.json({
        status: 'success',
        message: 'Dashboard data retrieved successfully',
        ingredients: getIngredients().map(ingredient => ingredient.name), // Contoh data
        randomRecipes: getRecipes().slice(0, 5).map(recipe => recipe.name)
    });
};

// function mengambil resep 
const getRecipeDetails = (req, res) => {
    const recipeId = parseInt(req.query.id);
    const recipe = getRecipeById(recipeId);
    if (recipe) {
        res.json({
            status: 'success',
            message: 'Recipe retrieved successfully',
            data: recipe
        });
    } else {
        res.json({
            status: 'failure',
            message: 'Recipe not found'
        });
    }
};

module.exports = {
    getIngredientDetails,
    getDashboard,
    getRecipeDetails
};
