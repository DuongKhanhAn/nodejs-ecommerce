const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const app = express()

// init middlewares
app.use(morgan("dev"))
// morgan("combined")
// morgan("common")
// morgan("short")
// morgan("tiny")
app.use(helmet())
app.use(compression())


// init db
app.get('/', (req, res, next) => {
    const strCompress = 'Hello'

    return res.status(200).json({
        message: 'Welcome!',
        metadata: strCompress.repeat(10000)
    });
})

// init routers

// handling error

module.exports = app