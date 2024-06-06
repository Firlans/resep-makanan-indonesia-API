const firestore = require("./db");
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    projectId: 'recipes-api-424908',
    keyFilename: 'recipes-api-424908-aedd4aa9c744.json',
});

// konfigurasi nama bucket
const bucketName = 'ingredient-details-recipes-api';
const bucket = storage.bucket(bucketName);

// save data user
const addUser = async (data) => {
  try {
    const docRef = await firestore.collection("users").add(data);
    console.log("Document written with ID: ", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

const updateUser = async (userId, userData) => {
  try {
    const docRef = await firestore.collection("users").doc(userId).update({
      name: userData.name,
      password : userData.password,
      phoneNumber: userData.phoneNumber,
      idAvatar : userData.idAvatar,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

const getUsers = async () => {
   try {
     const usersCollection = firestore.collection("users");
     const snapshot = await usersCollection.get();

     if (snapshot.empty) {
       console.log("No matching documents.");
       return [];
     }

     const users = [];
     snapshot.forEach((doc) => {
       users.push({
         id: doc.id,
         ...doc.data(),
       });
     });

     return users;
   } catch (error) {
     console.error("Error getting documents: ", error);
     throw error;
   }
 };

 const deleteUser = async (collectionName, documentId) => {
   try {
     const docRef = firestore.collection(collectionName).doc(documentId);
     await docRef.delete();
     console.log(`Document ${documentId} successfully deleted.`);
   } catch (error) {
     console.error('Error deleting document: ', error);
   }
 }

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
     const snapshot = await firestore.collection('ingredients').get();
     const ingredients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     return ingredients;
 };

 // GET ingredients by id
 const getIngredientById = async (id) => {
     const doc = await firestore.collection('ingredients').doc(id.toString()).get();
     if (!doc.exists) {
         return null;
     }
     return { id: doc.id, ...doc.data() };
 };

 // get all recipes
 const getRecipes = async () => {
     const snapshot = await firestore.collection('recipes').get();
     const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     return recipes;
 };

 // get recipes by id
 const getRecipeById = async (id) => {
     const doc = await firestore.collection('recipes').doc(id.toString()).get();
     if (!doc.exists) {
         return null;
     }
     return { id: doc.id, ...doc.data() };
 };

 //menambahkan bahan
 const addIngredient = async (ingredient, file) => {
     const imageUrl = await uploadImage(file);
     const docRef = await firestore.collection('ingredients').add({
         ...ingredient,
         id_picture: imageUrl
     });
     const newIngredient = await docRef.get();
     return { id: newIngredient.id, ...newIngredient.data() };
 };

 // menambahkan resep
 const addRecipe = async (recipe) => {
     const docRef = await firestore.collection('recipes').add(recipe);
     const newRecipe = await docRef.get();
     return { id: newRecipe.id, ...newRecipe.data() };
 };

 // mengupdate bahan
 const updateIngredient = async (id, updateData, file) => {
     if (file) {
         const imageUrl = await uploadImage(file);
         updateData.id_picture = imageUrl;
     }
     await firestore.collection('ingredients').doc(id.toString()).update(updateData);
     const updatedIngredient = await firestore.collection('ingredients').doc(id.toString()).get();
     return { id: updatedIngredient.id, ...updatedIngredient.data() };
 };

 // mengupdate resep
 const updateRecipe = async (id, updatedData) => {
     await firestore.collection('recipes').doc(id.toString()).update(updatedData);
     const updatedRecipe = await firestore.collection('recipes').doc(id.toString()).get();
     return { id: updatedRecipe.id, ...updatedRecipe.data() };
 };

 // menghapus bahan by id
 const deleteIngredientById = async (id) => {
     await firestore.collection('ingredients').doc(id.toString()).delete();
 };

 // menghapus semua bahan
 const deleteAllIngredients = async () => {
     const snapshot = await firestore.collection('ingredients').get();
     const batch = firestore.batch();
     snapshot.docs.forEach(doc => {
         batch.delete(doc.ref);
     });
     await batch.commit();
 };

 // menghapus resep by id
 const deleteRecipeById = async (id) => {
     await firestore.collection('recipes').doc(id.toString()).delete();
 };

 // menghapus semua resep
 const deleteAllRecipes = async () => {
     const snapshot = await firestore.collection('recipes').get();
     const batch = firestore.batch();
     snapshot.docs.forEach(doc => {
         batch.delete(doc.ref);
     });
     await batch.commit();
 };

 module.exports = {
    addUser,
    getUsers,
    updateUser,
    deleteUser,
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
