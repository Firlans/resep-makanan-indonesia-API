// src/services/storeData.js
const db = require('./db.js');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: 'recipes-api-424908',
    keyFilename: 'recipes-api-424908-aedd4aa9c744.json',
});

// konfigurasi nama bucket
const bucketName = 'ingredient-details-recipes-api';
const bucket = storage.bucket(bucketName);

// fungsi untuk mengunggah gambar ke Cloud Storage
const uploadImage = async (file) => {
    const { originalname, buffer} = file;
    const blob = bucket.file(originalname);
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    await new Promise((resolve, reject) => {
        blobStream.on('finish', resolve);
        blobStream.on('error', reject);
        blobStream.end(buffer);
    });

    return `https://storage.googleapis.com/${bucketName}/${originalname}`;
}

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
    const imageUrl = await uploadImage(file);
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
    const updatedIngredient = await db.collection('ingredients').doc(id.string()).get();
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
    deleteAllRecipes
};
