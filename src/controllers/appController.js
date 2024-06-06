const { 
    getIngredients, 
    getIngredientById, 
    getRecipes, 
    getRecipeById, 
    addIngredient, 
    addRecipe,
    updateIngredient, 
    updateRecipe, 
    deleteIngredientById, 
    deleteAllIngredients, 
    deleteRecipeById, 
    deleteAllRecipes 
} = require('../services/storeData');
const multer = require('multer');
const upload = multer();

// mengambil semua data bahan
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

// mengambil semua resep
const getAllRecipes = async (req, res) => {
    try {
        const recipes = await getRecipes();
        res.json({
            status:'success',
            message: 'semua resep berhasil didapatkan',
            data: recipes
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
}

// mengambil data bahan berdasarkan id
const getIngredientsDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const ingredient = await getIngredientById(id);
  
      if (!ingredient) {
        return res.status(404).json({
          status: 'fail',
          message: 'Bahan tidak ditemukan',
        });
      }
  
      res.json({
        status: 'success',
        data: ingredient,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Server sedang bermasalah',
        error: error.message,
      });
    }
  };
  

// mengambil data resep berdasarkan id
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

// mengambil data dashboard
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

// menambahkan bahan
const createIngredient = async (req, res) => {
    
    try {
        const { name, benefit } = req.body;

        if (!name || !benefit || !req.file) {
            return res.status(400).json({
                status: 'fail',
                message: 'silahkan isi nama bahan, benefit, dan gambar bahan'
            });
        }

        const benefitArray = benefit
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

        const ingredientData = { 
            name, 
            benefitArray
        };

        const newIngredient = await addIngredient(ingredientData, req.file);
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

// fungsi mengupdate bahan
const updateIngredientData = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedIngredient = await updateIngredient(id, updatedData, req.file);
        res.json({
            status: 'success',
            message: 'Bahan berhasil diperbarui',
            data: updatedIngredient
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

// fungsi menghapus bahan by id
const deleteIngredient = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteIngredientById(id);
        res.json({
            status: 'success',
            message: 'Bahan berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

// fungsi menghapus semua data bahan
const deleteAllIngredientsData = async (req, res) => {
    try {
        await deleteAllIngredients();
        res.json({
            status: 'success',
            message: 'Semua bahan berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

// menambahkan resep
const createRecipe = async (req, res) => {
    try {
        const {name, description, bahanBahan, langkahPembuatan, asalDaerah, author} = req.query;

        if (!name || !description || !bahanBahan || !langkahPembuatan || !asalDaerah || !author) {
            return res.status(400).json({
                status: 'fail',
                message: 'silahkan isi nama, deskripsi makanan, bahan-bahan yang diperlukan, langkah pembuatan, asal dearah, serta author'
            });
        }

        const bahanBahanArray = bahanBahan
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

        const langkahPembuatanArray = langkahPembuatan
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

        const recipeData = {
            name,
            description,
            bahanBahanArray,
            langkahPembuatanArray,
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
};

// fungsi mengupdate resep
const updateRecipeData = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedRecipe = await updateRecipe(id, updatedData);
        res.json({
            status: 'success',
            message: 'Resep berhasil diperbarui',
            data: updatedRecipe
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

// fungsi menghapus resep by id
const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteRecipeById(id);
        res.json({
            status: 'success',
            message: 'Resep berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

// fungsi menghapus semua data resep
const deleteAllRecipesData = async (req, res) => {
    try {
        await deleteAllRecipes();
        res.json({
            status: 'success',
            message: 'Semua resep berhasil dihapus'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

module.exports = {
    getAllIngredients,
    getAllRecipes,
    getIngredientsDetails,
    getRecipeDetails,
    getDashboard,
    createIngredient,
    updateIngredientData,
    deleteIngredient,
    deleteAllIngredientsData,
    createRecipe,
    updateRecipeData,
    deleteRecipe,
    deleteAllRecipesData
};
