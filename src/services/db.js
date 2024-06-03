const {Firestore} = require('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore({
  projectId: 'recipes-api-424908',
  keyFilename: "recipes-api-424908-aedd4aa9c744.json",
});

module.exports = firestore;