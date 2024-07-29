const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/user'); // Notez le chemin relatif correct
const Article = require('./models/article'); // Notez le chemin relatif correct

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/votre_base_de_donnees', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error', err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de gestion de session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Middleware de vérification d'authentification
function requireLogin(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });

        if (user) {
            req.session.loggedIn = true;
            res.redirect('/home'); // Redirige vers la page d'accueil après connexion
        } else {
            res.status(401).send('Nom d’utilisateur ou mot de passe incorrect');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            res.status(409).send('Nom d’utilisateur déjà pris');
        } else {
            const newUser = new User({ username, password });
            await newUser.save();
            res.send('Inscription réussie !');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Page d'accueil une fois connecté
app.get('/home', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Route protégée pour créer un article
app.get('/create-article', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create_article.html'));
});

app.post('/create-article', requireLogin, async (req, res) => {
    const { name, code, description, image, price, quantity } = req.body;

    try {
        const newArticle = new Article({ name, code, description, image, price, quantity });
        await newArticle.save();
        res.send('Article créé avec succès !');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour voir tous les articles
app.get('/view-articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'view_articles.html'));
});

app.get('/articles', async (req, res) => {
    try {
        const articles = await Article.find();
        res.json(articles);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur de lecture des articles');
    }
});

// Route pour visualiser un article spécifique
app.get('/view-article/:code', async (req, res) => {
    const articleCode = req.params.code;

    try {
        const article = await Article.findOne({ code: articleCode });

        if (article) {
            res.sendFile(path.join(__dirname, 'views', 'view_article.html'));
        } else {
            res.status(404).send('Article non trouvé');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
