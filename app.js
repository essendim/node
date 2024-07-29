const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            req.session.loggedIn = true;
            res.redirect('/home'); // Redirige vers la page d'accueil après connexion
        } else {
            res.status(401).send('Nom d’utilisateur ou mot de passe incorrect');
        }
    });
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('users.json', 'utf8', (err, data) => {
        if (err) throw err;
        const users = JSON.parse(data);
        const userExists = users.some(user => user.username === username);

        if (userExists) {
            res.status(409).send('Nom d’utilisateur déjà pris');
        } else {
            users.push({ username, password });
            fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
                if (err) throw err;
                res.send('Inscription réussie !');
            });
        }
    });
});

// Page d'accueil une fois connecté
app.get('/home', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Route protégée pour créer un article
app.get('/create-article', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'create_article.html'));
});

app.post('/create-article', requireLogin, (req, res) => {
    const { name, code, description, image, price, quantity } = req.body;

    fs.readFile('articles.json', 'utf8', (err, data) => {
        if (err) throw err;
        const articles = JSON.parse(data);
        articles.push({ name, code, description, image, price, quantity });

        fs.writeFile('articles.json', JSON.stringify(articles, null, 2), (err) => {
            if (err) throw err;
            res.send('Article créé avec succès !');
        });
    });
});

// Route pour voir tous les articles
app.get('/view-articles', (req, res) => {
    fs.readFile('articles.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Erreur de lecture des articles');
            return;
        }
        const articles = JSON.parse(data);
        res.sendFile(path.join(__dirname, 'views', 'view_articles.html'));
    });
});

app.get('/articles', (req, res) => {
    fs.readFile('articles.json', 'utf8', (err, data) => {
        if (err) throw err;
        const articles = JSON.parse(data);
        res.json(articles);
    });
});

// Route pour visualiser un article spécifique
// Assurez-vous que toutes les routes qui servent des fichiers HTML statiques utilisent res.sendFile()
app.get('/view-article/:code', (req, res) => {
    const articleCode = req.params.code;

    fs.readFile('articles.json', 'utf8', (err, data) => {
        if (err) throw err;
        const articles = JSON.parse(data);
        const article = articles.find(a => a.code === articleCode);

        if (article) {
            res.sendFile(path.join(__dirname, 'views', 'view_article.html'));
        } else {
            res.status(404).send('Article non trouvé');
        }
    });
});




app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
