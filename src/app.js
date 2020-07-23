require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')

const { NODE_ENV } = require('./config')
const logger = require('./logger')

const folderRouter = require('./folders/folders-router')
const notesRouter = require('./notes/notes-router')
const app = express()

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common'

app.use(morgan(morganOption))
app.use(express.json())
app.use(cors())
app.use(helmet())

// app.use(function validateBearerToken(req, res, next) {
// 	const apiToken = process.env.API_TOKEN
// 	const authToken = req.get('Authorization')

// 	if (!authToken || authToken.split(' ')[1] !== apiToken) {
// 		logger.error(`Unauthorized request to path: ${req.path}`)
// 		return res.status(401).json({ error: 'Unauthorized request' })
// 	}
// 	// move to the next middleware
// 	next()
// })
app.use('/api/folders', folderRouter)
app.use('/api/notes', notesRouter)
// app.use('api/notes', notesRouter)
app.get('/', (req, res) => res.send('Hello, world!'))

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _next) => {
	let response
	if (NODE_ENV === 'production') {
		response = { error: { message: 'server error' } }
	} else {
		logger.error(error)
		response = { message: error.message, error }
	}
	res.status(500).json(response)
})

module.exports = app
