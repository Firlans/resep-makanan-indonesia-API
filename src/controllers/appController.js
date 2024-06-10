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
    deleteAllRecipes,
    searchIngredientsByName,
    searchRecipesByIngredient
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

// fungsi mendapatkan data bahan berdasarkan nama
const getIngredientsByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({
                status: 'fail',
                message: 'Nama bahan harus diisi'
            });
        }

        const ingredients = await searchIngredientsByName(name);
        if (ingredients.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Bahan tidak ditemukan'
            });
        }

        res.json({
            status: 'success',
            message: 'Bahan berhasil ditemukan',
            data: ingredients
        });
    } catch (error) {
        console.error("Error in getIngredientsByName", error);
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

// fungsi mendapatkan resep berdasarkan bahan
const getRecipesByIngredient = async (req, res) => {
    try {
        const { ingredient } = req.query;
        if (!ingredient) {
            return res.status(400).json({
                status: 'fail',
                message: 'Nama bahan harus diisi'
            });
        }

        const recipes = await searchRecipesByIngredient(ingredient);
        if (recipes.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'Resep tidak ditemukan untuk bahan tersebut'
            });
        }

        res.json({
            status: 'success',
            message: 'Resep berhasil ditemukan',
            data: recipes
        });
    } catch (error) {
        console.error("Error in getRecipesByIngredient", error);
        res.status(500).json({
            status: 'error',
            message: 'Server sedang bermasalah',
            error: error.message
        });
    }
};

// mengambil data resep berdasarkan id
const getRecipeDetails = async (req, res) => {
    const recipeId = req.params.id
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
        const { name, benefit, id_picture } = req.query;
        const file = req.file;

        // Log request query dan file
        console.log("Request Query:", req.query);
        console.log("Uploaded File:", file);

        // Verifikasi parameter yang diperlukan dan file
        if (!name || !benefit || !file) {
            return res.status(400).json({
                status: 'fail',
                message: 'Silakan isi nama bahan, benefit, dan gambar bahan'
            });
        }

        // Proses benefit
        const benefitArray = benefit
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const ingredientData = { 
            name, 
            benefit: benefitArray,
            id_picture: id_picture || file.originalname
        };

        // Tambahkan bahan
        const newIngredient = await addIngredient(ingredientData, file);
        res.json({
            status: 'success',
            message: 'Bahan berhasil ditambahkan',
            data: newIngredient
        });
    } catch (error) {
        console.error("Error in createIngredient:", error);
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

// fungsi mendapatkan resep berdasarkan nama
const getRecipesByName = async (req, res) => {
    const { name } = req.query;
  
    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "name query parameter is required",
      });
    }
  
    try {
      const recipesRef = db.collection('resep');
      const snapshot = await recipesRef.get();
  
      if (snapshot.empty) {
        console.log("No recipes found in the database.");
        return res.status(404).json({
          status: "fail",
          message: "No recipes found",
        });
      }
  
      const recipes = [];
      const lowerCaseName = name.toLowerCase();
  
      snapshot.forEach(doc => {
        const recipe = doc.data();
        console.log(`Checking recipe: ${recipe.name.toLowerCase()} against ${lowerCaseName}`);
        if (recipe.name.toLowerCase() === lowerCaseName) {
          recipes.push({ id: doc.id, ...recipe });
        }
      });
  
      if (recipes.length === 0) {
        console.log("No matching documents found.");
        return res.status(404).json({
          status: "fail",
          message: "Bahan tidak ditemukan",
        });
      }
  
      console.log("Matching recipes found: ", recipes);
  
      return res.status(200).json({
        status: "success",
        message: "Recipes retrieved successfully",
        data: recipes,
      });
    } catch (error) {
      console.error("Error getting recipes by name: ", error);
      return res.status(500).json({
        status: "error",
        message: "An error occurred while retrieving recipes",
      });
    }
  };    

module.exports = {
    getAllIngredients,
    getAllRecipes,
    getIngredientsDetails,
    getIngredientById,
    getRecipesByIngredient,
    getIngredientsByName,
    getRecipeDetails,
    getDashboard,
    createIngredient,
    updateIngredientData,
    deleteIngredient,
    deleteAllIngredientsData,
    createRecipe,
    updateRecipeData,
    deleteRecipe,
    deleteAllRecipesData,
    getRecipesByName
};
