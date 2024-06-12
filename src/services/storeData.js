const firestore = require("./db");
const { Storage } = require('@google-cloud/storage');
const mime = require('mime-types');
const storage = new Storage({
    projectId: process.env.ID_PROJECT,
    keyFilename: process.env.SERVICE_ACCOUNT,
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
            password: userData.password,
            phoneNumber: userData.phoneNumber,
            idAvatar: userData.idAvatar,
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
const uploadImage = async (file, filename) => {
    if (!file || !filename) {
        throw new Error('A file and a file name must be specified.');
    }


    // duplikasi gambar
    const blob = bucket.file(filename);
    const [exists] = await blob.exists();
    if (exists) {
        // Hapus file jika ada
        await blob.delete();
    }

    const contentType = mime.lookup(file.originalname) || 'application/octet-stream';
    const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: contentType,  // Set the content type here
    });

    return new Promise((resolve, reject) => {
        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        }).on('error', (err) => {
            reject(err);
        }).end(file.buffer);
    });
};

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
    const imageUrl = await uploadImage(file, ingredient.id_picture);
    const docRef = await db.collection('ingredients').add({
        ...ingredient,
        id_picture: imageUrl,
        normalized_name: ingredient.name.trim().toLowerCase()
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
        const name = updateData.name.toLowerCase();
        const imageUrl = await uploadImage(file, `ingredent-${name}`);
        updateData.id_picture = imageUrl;
    }
    await db.collection('ingredients').doc(id.toString()).update(updateData);
    const updatedIngredient = await db.collection('ingredients').doc(id.toString()).get();
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
    try {
        await db.collection('ingredients').doc(id.toString()).delete();
    } catch (error) {
        console.error(error);
        return null;
    }
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

// fungsi mendapatkan bahan berdasarkan nama
// fungsi search bahan berdasarkan nama
const searchIngredientsByName = async (name) => {
    const normalizedIngredientName = name.trim().toLowerCase().replace(/\s+/g, ''); // Normalisasi input dengan menghapus spasi
    const ingredientsRef = firestore.collection('ingredients');
    const snapshot = await ingredientsRef.get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return [];
    }

    let ingredients = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const normalizedDataName = data.name.trim().toLowerCase().replace(/\s+/g, ''); // Normalisasi data dari database dengan menghapus spasi
        if (normalizedDataName.includes(normalizedIngredientName)) {
            ingredients.push({ id: doc.id, ...data });
        }
    });

    if (ingredients.length === 0) {
        console.log('No matching documents.');
    }

    return ingredients;
};

// fungsi mendapatkan resep berdasarkan bahan
const searchRecipesByIngredient = async (ingredient) => {
    const normalizedIngredient = ingredient.trim().toLowerCase();
    const recipesRef = firestore.collection('recipes');
    const snapshot = await recipesRef.get();

    if (snapshot.empty) {
        console.log('Tidak ada dokumen yang cocok.');
        return [];
    }

    let recipes = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.bahan) {
            const normalizedIngredientsArray = data.bahan.map(item => item.replace(/["']/g, "").toLowerCase());
            if (normalizedIngredientsArray.some(item => item.includes(normalizedIngredient))) {
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
    const normalizedRecipeName = name.trim().toLowerCase().replace(/\s+/g, ''); // Normalisasi input dengan menghapus spasi
    const recipesRef = firestore.collection('recipes');
    const snapshot = await recipesRef.get();

    if (snapshot.empty) {
        console.log('No matching documents.');
        return [];
    }

    let recipes = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        const normalizedDataName = data.name.trim().toLowerCase().replace(/\s+/g, ''); // Normalisasi data dari database dengan menghapus spasi
        if (normalizedDataName.includes(normalizedRecipeName)) {
            recipes.push({ id: doc.id, ...data });
        }
    });

    if (recipes.length === 0) {
        console.log('No matching documents.');
    }

    return recipes;
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
    deleteAllRecipes,
    searchIngredientsByName,
    searchRecipesByIngredient,
    searchRecipesByName,
    searchIngredientsByName,
    searchRecipesByIngredient,
    searchRecipesByName
};
