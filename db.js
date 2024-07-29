const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/votre_base_de_donnees', {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

module.exports = mongoose;
