// src/services/storeData.js
const db = require('./db.js');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// konfigurasi nama bucket
const bucketName = 'ingredient-details-recipes-api';
const bucket = storage.bucket(bucketName);

// fungsi untuk mengunggah gambar ke Cloud Storage
const uploadImage = async (file, idPicture) => {
    const { buffer } = file;
    const blob = bucket.file(idPicture);
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    await new Promise((resolve, reject) => {
        blobStream.on('finish', resolve);
        blobStream.on('error', reject);
        blobStream.end(buffer);
    });

    return `https://storage.googleapis.com/${bucketName}/${idPicture}`;
};

// get all ingredients
const getIngredients = async () => {
    const snapshot = await db.collection('ingredients').get();
    const ingredients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return ingredients;
};

// GET ingredients by id
const getIngredientById = async (id) => {
    const doc = await db.collection('ingredients').doc(id.toString()).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
};

// get all recipes
const getRecipes = async () => {
    const snapshot = await db.collection('recipes').get();
    const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return recipes;
};

// get recipes by id
const getRecipeById = async (id) => {
    const doc = await db.collection('recipes').doc(id.toString()).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
};

//menambahkan bahan
const addIngredient = async (ingredient, file) => {
    const imageUrl = await uploadImage(file, ingredient.id_picture);
    const docRef = await db.collection('ingredients').add({
        ...ingredient,
        id_picture: imageUrl
    });
    const newIngredient = await docRef.get();
    return { id: newIngredient.id, ...newIngredient.data() };
};

// menambahkan resep
const addRecipe = async (recipe) => {
    const docRef = await db.collection('recipes').add(recipe);
    const newRecipe = await docRef.get();
    return { id: newRecipe.id, ...newRecipe.data() };
};

// mengupdate bahan
const updateIngredient = async (id, updateData, file) => {
    if (file) {
        const imageUrl = await uploadImage(file);
        updateData.id_picture = imageUrl;
    }
    await db.collection('ingredients').doc(id.toString()).update(updateData);
    const updatedIngredient = await db.collection('ingredients').doc(id.toString()).get();
    return { id: updatedIngredient.id, ...updatedIngredient.data() };
};

// mengupdate resep
const updateRecipe = async (id, updatedData) => {
    await db.collection('recipes').doc(id.toString()).update(updatedData);
    const updatedRecipe = await db.collection('recipes').doc(id.toString()).get();
    return { id: updatedRecipe.id, ...updatedRecipe.data() };
};

// menghapus bahan by id
const deleteIngredientById = async (id) => {
    await db.collection('ingredients').doc(id.toString()).delete();
};

// menghapus semua bahan
const deleteAllIngredients = async () => {
    const snapshot = await db.collection('ingredients').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

// menghapus resep by id
const deleteRecipeById = async (id) => {
    await db.collection('recipes').doc(id.toString()).delete();
};

// menghapus semua resep
const deleteAllRecipes = async () => {
    const snapshot = await db.collection('recipes').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

// fungsi mendapatkan bahan berdasarkan nama
const searchIngredientsByName = async (name) => {
    const ingredientsRef = db.collection('ingredients');
    const snapshot = await ingredientsRef.where('name', '==', name).get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return [];
    }

    let ingredients = [];
    snapshot.forEach(doc => {
        ingredients.push({ id: doc.id, ...doc.data() });
    });

    return ingredients;
};

// fungsi mendapatkan resep berdasarkan bahan
const searchRecipesByIngredient = async (ingredient) => {
    console.log(`Mencari resep dengan bahan: ${ingredient}`);
    const normalizedIngredient = ingredient.trim().toLowerCase();
    const recipesRef = db.collection('recipes');
    const snapshot = await recipesRef.get();

    if (snapshot.empty) {
        console.log('Tidak ada dokumen yang cocok.');
        return [];
    }

    let recipes = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Memeriksa resep: ${data.name}`);
        if (data.bahanBahanArray) {
            const normalizedIngredientsArray = data.bahanBahanArray.map(item => item.replace(/["']/g, "").trim().toLowerCase());
            if (normalizedIngredientsArray.some(item => item.includes(normalizedIngredient))) {
                console.log(`Menambahkan resep: ${data.name}`);
                recipes.push({ id: doc.id, ...data });
            } else {
                console.log(`Bahan ${normalizedIngredient} tidak ditemukan dalam resep: ${data.name}`);
            }
        }
    });

    if (recipes.length === 0) {
        console.log('Tidak ada dokumen yang cocok.');
    }

    return recipes;
};

// fungsi search resep dengan nama
const searchRecipesByName = async (name) => {
    const normalizedRecipeName = name.trim().toLowerCase(); // Normalisasi input
    const recipesRef = db.collection('recipes');
    const snapshot = await recipesRef.get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return [];
    }

    let recipes = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const normalizedDataName = data.name.trim().toLowerCase(); // Normalisasi data dari database
        if (normalizedDataName === normalizedRecipeName) {
            recipes.push({ id: doc.id, ...data });
        }
    });

    if (recipes.length === 0) {
        console.log('No matching documents.');
    }

    return recipes;
};

module.exports = {
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
};
