const path = require('path')
const express = require('express')
const hbs = require('hbs')

const geocode = require('./utils/geocode.js')
const forecast = require('./utils/forecast.js')

// call express to create new application
const app = express()

// Define paths for express config
const publicDirectory = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory for express to serve
// (It recognizes all the web pages in the static directory 
// and builds the routing)
app.use(express.static(publicDirectory))


// Setup the path to the Index page (using handlebar)
app.get('', (req, res) => {
    res.render('index', {
        title: 'Weather App',
        name: 'Jesse G.'
    })
})

// Setup the path to the About page (using handlebar)
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About',
        name: 'Jesse G.'
    })
})

// Setup the path to the Help page (using handlebar)
app.get('/help', (req, res) => {
    res.render('help', {
        title: 'Help',
        message: 'This is the help page.',
        name: 'Jesse G.'
    })
})

// These other routes determine what is served for the other pages

app.get('/weather', (req, res) => {
    
    const city = req.query.address

    if (!city) {
        return res.send({
            error: 'You must provide a city'
        })
    }

    // Call geoCode to translate city to it's coordinates
    geocode(city, (error, {latitude, longitude, location} = {}) => {
        // if we get an error return it
        if (error) {
            return res.send({
                error
            })
        }
        // Use the results from geocode to call forecast
        forecast(latitude, longitude, (error, forecast) => {
            if (error) {
                return res.send({
                    error
                })
            }
            
            // return forecast data
            res.send({
                forecast,
                location,
                address: req.query.address
            })
        })
    })
    
})

app.get('/products', (req, res) => {
    // Make sure they provide a search term
    if (!req.query.search) {
        return res.send({
            error: 'You must provide a search term'
        })
    }
    
    res.send({
        products: []
    })
})

app.get('/help/*', (req, res) => {
    res.render('404page', {
        title: '404: Page Not Found',
        name: 'Jesse G.',
        errorMessage: 'Unable to find help article'
    })
})

// generic 404 page to match anything that hasn't been matched above
app.get('*', (req, res) => {
    res.render('404page', {
        title: '404: Page Not Found',
        name: 'Jesse G.',
        errorMessage: 'Unable to find the requested page.'
    })
})

// starts server and has port listen at port 3000
app.listen(3000, () => {
    console.log('Server has started on port 3000')
})

// We can shut down the webserver with ctrl + c
