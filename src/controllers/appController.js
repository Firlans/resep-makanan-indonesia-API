const { uploadToGCS } = require('../services/storage');
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
    searchRecipesByIngredient,
    searchRecipesByName
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
            status: 'success',
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
            res.status(404).json({
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
        const { name, benefit } = req.query;
        const file = req.file;

        // Verifikasi parameter yang diperlukan dan file
        if (!name || !benefit || !file) {
            return res.status(400).json({
                status: 'fail',
                message: 'Silakan isi nama bahan, benefit, dan gambar bahan'
            });
        }

        // verifikasi data duplicat
        const ingredients = await getIngredients();
        const duplicate = ingredients.find(ingredientData => ingredientData.name === name);

        if (duplicate) {
            return res.status(409).json({
                status: "fail",
                message: `bahan ${name} sudah ada`
            })
        }

        // Proses benefit
        const benefitArray = benefit
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const ingredientData = {
            name,
            benefit: benefitArray,
            id_picture: file ? `ingredient-${name}` : "ingredient-default"
        };

        // Tambahkan bahan
        const newIngredient = await addIngredient(ingredientData, file);
        return res.json({
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
        const updatedData = req.query;
        const file = req.file;

        // mencari data dengan id
        const ingredients = await getIngredients()
        const availableIngredient = ingredients.find(ingredientData => ingredientData.id === id)
        if (!availableIngredient) {
            return res.status(404).json({
                status: "fail",
                message: `${id} tidak dapat ditemukan`
            })
        }

        const updatedIngredient = await updateIngredient(id, updatedData, file);
        res.json({
            status: 'success',
            message: 'Bahan berhasil diperbarui',
            data: updatedIngredient
        });
    } catch (error) {
        console.error("Error in updateIngredientData:", error);
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
        const ingredents = await getIngredients();
        const data = ingredents.find(ingredientData => ingredientData.id === id);
        if (!data) {
            return res.status(404).json({
                status: "fail",
                message: `ID ${id} tidak ditemukan`
            })
        }
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
        const { name, description, bahanBahan, langkahPembuatan, asalDaerah, author } = req.query;
        const file = req.file;

        if (!name || !author || !file) {
            return res.status(400).json({
                status: 'fail',
                message: 'silahkan isi nama, dan author'
            });
        }

        const bahanBahanArray = bahanBahan
            .split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const langkahPembuatanArray = langkahPembuatan
            .split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const recipeData = {
            name,
            description,
            bahan: bahanBahanArray,
            langkah_pembuatan: langkahPembuatanArray,
            asal_daerah: asalDaerah,
            author,
            id_picture: file ? `recipe-picture-${name}` : "recipe-picture-default"
        };

        const newRecipe = await addRecipe(recipeData, file);
        res.json({
            status: 'success',
            message: 'Resep berhasil ditambahkan',
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
        const updatedData = req.query;

        const recipes = await getRecipes();
        const target = recipes.find(recipeData => recipeData.id === id);
        if (!target) {
            return res.status(404).json({
                status: "fail",
                message: `ID ${id} tidak ditemukan`
            });
        }

        const bahanBahanArray = updatedData.bahanBahan
            .split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const langkahPembuatanArray = updatedData.langkahPembuatan
            .split(',')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // Get all ingredients from database
        const ingredients = await getIngredients();
        const ingredientPictures = bahanBahanArray.map(bahan => {
            const foundIngredient = ingredients.find(ingredient => ingredient.name.toLowerCase() === bahan.toLowerCase());
            return foundIngredient ? foundIngredient.id_picture : null;
        }).filter(pic => pic !== null);

        const updatedRecipeData = {
            name: updatedData.name,
            description: updatedData.description,
            bahan: bahanBahanArray,
            langkah_pembuatan: langkahPembuatanArray,
            asal_daerah: updatedData.asalDaerah,
            author: updatedData.author,
            id_picture: ingredientPictures.length > 0 ? ingredientPictures[0] : target.id_picture
        };

        const updatedRecipe = await updateRecipe(id, updatedRecipeData);
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
        const recipes = await getRecipes();
        const target = recipes.find(ingredientData => ingredientData.id === id   )
        if(!target){
            return res.status(404).json({
                status: "fail",
                message: `ID ${id} tidak ditemukan`
            })
        }
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
        const recipes = await searchRecipesByName(name);

        if (recipes.length === 0) {
            console.log("No matching documents found.");
            return res.status(404).json({
                status: "fail",
                message: "Bahan tidak ditemukan",
            });
        }

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
