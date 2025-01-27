const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')
const logger = require('./logger')
const knex = require('knex')

const db = knex({
	client: 'pg',
	connection: DATABASE_URL,
})

app.set('db', db)
app.listen(PORT, () =>
	logger.info(`Server listening at http://localhost:${PORT}`)
)
