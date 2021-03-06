// Main dependencies
const express           = require('express')
const methodOverride    = require('method-override')
const session           = require('express-session')
const compression       = require('compression')
const helmet            = require('helmet')
const multer            = require('multer')
const bodyParser        = require('body-parser')
const morgan            = require('morgan')
const upload            = multer({ dest: 'uploads/' })
const app               = express()

// Database Setup
const Database = require('./controllers/db/DatabaseController')
const DB = new Database()
DB.connect()

// Route Setup
const RouteController = require('./controllers/routes/RouteController')
const Route = new RouteController()

// Error Handler
const ErrorController = require('./controllers/ErrorController')

// App config
app.set('view engine', 'ejs')
app.set('views', 'views/pages')
app.use(methodOverride('_method'))
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
app.use('/uploads', express.static('uploads'))
app.use(express.json())
app.listen(8080)

// Index Route
app.get('/', (req, res) => {
    DB.getAllGutars((err, documents) => {
        if (err) {
            ErrorController.throw(err)
        } else {
            Route.process('index', req, res, {
                user: req.session.user,
                data: documents
            })
        }
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

app.post('/add-guitar', upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
    DB.addNewGuitar(req.body, req.files, () => {
        res.redirect('/')
    })
})

// Detail Page Route
app.get('/guitar/:id', (req, res) => {
    DB.getSingleGuitar(req.params.id, (err, guitar) => {
        if (err) {
            Route.notFound(res)
        } else {
            Route.process('detail', req, res, guitar)
        }  
    })   
})

// Edit Guitar Page Route
app.get('/guitar/:id/edit', (req, res) => {
    DB.getSingleGuitar(req.params.id, (err, guitar) => {
        if (err) {
            Route.notFound(res)
        } else {
            Route.process('edit', req, res, guitar)
        }  
    })   
})

// Update Guitar Route
app.put('/guitar/:id/edit', upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
    DB.updateGuitar(req.params.id, req.body, req.files, (err) => {
        if (err) {
            ErrorController.throw(err)
        } else {
            res.redirect(`/guitar/${req.params.id}`)
        }
    })
})

// Delete Guitar Route
app.delete('/guitar/:id/delete', (req, res) => {
    DB.deleteGuitar(req.params.id, (err) => {
        if (err) {
            ErrorController.throw(err)
        } else {
            res.redirect('/')
        }
    }) 
})


// Logout Route
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                ErrorController.throw(err)
            } else {
                return res.redirect('/')
            }
        });
    }
});

app.get('/:invalidparam', (req, res) => {
    Route.notFound(res)
})