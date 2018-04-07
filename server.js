// Main dependencies
const express = require('express')
const session = require('express-session')
const compression = require('compression')
const helmet = require('helmet')
const multer = require('multer')
const upload = multer()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()

// Database Setup
const Database = require('./controllers/db/DatabaseController')
const DB = new Database()
DB.connect()

// Route Modules
const RouteController = require('./controllers/routes/RouteController')
const Route = new RouteController()

// App config
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())
app.use(session({
    secret: 'BE-assessment-secret',
    resave: true,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(express.static('uploads'))
app.use(express.json())
app.listen(8080)

// Index Route
app.get('/', (req, res) => {
    Route.process('index', req, res, {
        user: req.session.user
    })
})

// Login Route
app.get('/login', (req, res) => {
    Route.process('login', req, res)
})

app.post('/login', (req, res) => {
    DB.validateUser(req.body, user => {
        req.session.user = user.user_name
        res.redirect('/')
    })
})

// Register Route
app.get('/register', (req, res) => {
    Route.process('register', req, res)
})

app.post('/register', (req, res) => {
    DB.addNewUser(req.body, () => res.redirect('/login'))
})

// About Route
app.get('/about', (req, res) => {
    Route.process('about', req, res, {
        msg: 'About'
    })
})

// Add Guitar Route
app.get('/add-guitar', (req, res) => {
    Route.process('add-guitar', req, res)
})

app.post('/add-guitar', upload.array(), (req, res) => {
    DB.addNewGuitar(req.body, () => {
        res.redirect('/')
    })
})

// Detail Page Route
app.get('/guitar/:id', (req, res) => {
    Route.process('detail', req, res)
})

// Logout Route
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error(err)
            } else {
                return res.redirect('/')
            }
        });
    }
});