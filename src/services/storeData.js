// src/services/storeData.js
const db = require('./db.js');

// get ingredients
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

// get recipes
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

//menambahkan resep
const addIngredient = async (ingredient) => {
  const docRef = await db.collection('ingredients').add(ingredient);
  const newIngredient = await docRef.get();
  return { id: newIngredient.id, ...newIngredient.data() };
};

module.exports = {
    getIngredients,
    getIngredientById,
    getRecipes,
    getRecipeById,
    addIngredient
};
