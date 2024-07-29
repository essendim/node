const mongoose = require('../db');

const articleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
