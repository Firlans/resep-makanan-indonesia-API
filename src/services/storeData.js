const firestore = require('./db');

const addUser = async (data) => {
  try {
    const docRef = await firestore.collection('users').add(data);
    console.log('Document written with ID: ', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

const getUsers = async () => {
  try {
    const usersCollection = firestore.collection('users');
    const snapshot = await usersCollection.get();

    if (snapshot.empty) {
      console.log('No matching documents.');
      return [];
    }

    const users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting documents: ', error);
    throw error;
  }
};


module.exports = {addUser, getUsers}