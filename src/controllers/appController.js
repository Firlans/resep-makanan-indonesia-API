const { getIngredients, getIngredientById, getRecipes, getRecipeById, addIngredient } = require('../services/storeData');

const getAllIngredients = async (req, res) => {
    try {
        const ingredients = await getIngredients();
        res.json({
            status: 'success',
            message: 'Semua bahan berhasil didapatkan',
            data: ingredients
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

const getIngredientsDetails = async (req, res) => {
    const ingredientId = parseInt(req.query.id);
    try {
        const ingredient = await getIngredientById(ingredientId);
        if (ingredient) {
            res.json ({
                status: 'success',
                message: 'bahan berhasil didapatkan',
                data: ingredient
            });
        } else {
            res.json ({
                status: 'fail',
                message: 'bahan tidak ditemukan'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

const getRecipeDetails = async (req, res) => {
    const recipeId = parseInt(req.query.id);
    try {
        const recipe = await getRecipeById(recipeId);
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
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

const getDashboard = async (req, res) => {
    try {
        const ingredients = await getIngredients();
        const recipes = await getRecipes();
        res.json({
            status: 'success',
            message: 'Dashboard data retrieved successfully',
            ingredients: ingredients.map(ingredient => ingredient.name),
            randomRecipes: recipes.slice(0, 5).map(recipe => recipe.name)
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

const createIngredient = async (req, res) => {
    console.log('Request body:', req.query);
    try {
        const { name, benefit, id_picture } = req.query;

        if (!name || !benefit || !id_picture) {
            return res.status(400).json({
                status: 'fail',
                message: 'silahkan isi nama bahan, benefit, dan gambar bahan'
            });
        }

        const ingredientData = { 
            name, 
            benefit, 
            id_picture 
        };

        const newIngredient = await addIngredient(ingredientData);
        res.json({
            status: 'success',
            message: 'Bahan berhasil ditambahkan',
            data: newIngredient
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

const createRecipe = async (req, res) => {
    try {
        const {name, description, bahanBahan, langkahPembuatan, asalDaerah, author} = req.query;

        if (!name || !bahanBahan || !langkahPembuatan || asalDaerah) {
            return res.status(400).json({
                status: 'fail',
                message: 'silahkan isi nama, deskirpsi makanan, bahan-bahan yang diperlukan, langkah pembuatan, dan asal dearah'
            });
        }

        const recipeData = {
            name,
            description,
            bahanBahan,
            langkahPembuatan,
            asalDaerah,
            author
        };

        const newRecipe = await addRecipe(recipeData);
        res.json({
            status: 'success',
            message: 'Bahan berhasil ditambahkan',
            data: newRecipe
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
}


module.exports = {
    getAllIngredients,
    getIngredientsDetails,
    getRecipeDetails,
    getDashboard,
    createIngredient,
    createRecipe
};
