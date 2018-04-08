const Controller        = require('../Controller')
const ErrorController   = require('../ErrorController')
const dotenv            = require('dotenv').config()
const mongoose          = require('mongoose')
const UserModel         = require('../../models/UserModel')
const GuitarModel       = require('../../models/GuitarModel')

class DatabaseController extends Controller {
    constructor() {
        super()
        // Store database credentials
        this.DB_NAME     = process.env.DB_NAME
        this.DB_HOST     = process.env.DB_HOST
        this.DB_USER     = process.env.DB_USER
        this.DB_PASSWORD = process.env.DB_PASSWORD
        this.DB_URI      = `mongodb://${this.DB_USER}:${this.DB_PASSWORD}@${this.DB_HOST}/${this.DB_NAME}`
    }

    /** 
     * Connects to database
     */
    connect() {
        // Try connecting to database
        try {
            mongoose.connect(this.DB_URI)
            const db = mongoose.connection
            db.on('error', console.error.bind(console, 'connection error:'))
            db.once('open', () => console.log('[DB_CONTROLLER] Database Connection succesful!'))

        // Catch connection errors
        } catch (err) {
            ErrorController.throw(err)
        }
    }

    addNewUser(credentials, callback) {
        this.assertNotNull(credentials)
        UserModel.createUser(credentials, callback)
    }

    validateUser(credentials, callback) {
        this.assertNotNull(credentials)
        UserModel.authenticateUser(credentials, callback)
    }

    addNewGuitar(newGuitar, files, callback) {
        this.assertNotNull(newGuitar)
        GuitarModel.addGuitar(newGuitar, files, callback)
    }

    getSingleGuitar(id, callback) {
        this.assertNotNull(id)
        GuitarModel.getGuitarById(id, (err, doc) => callback(err, doc))
    }

    getAllGutars(callback) {
        GuitarModel.getAllGuitars((err, docs) => callback(err, docs))
    }
}

module.exports = DatabaseController