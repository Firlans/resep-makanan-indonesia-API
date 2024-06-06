const firestore = require("./db");

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


module.exports = { addUser, getUsers, updateUser, deleteUser };
