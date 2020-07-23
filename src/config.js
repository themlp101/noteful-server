module.exports = {
	PORT: process.env.PORT || 3000,
	NODE_ENV: process.env.NODE_ENV || 'development',
	API_KEY: process.env.API_KEY || null,
	DATABASE_URL:
		process.env.DATABASE_URL ||
		'postgresql://mattp@localhost/noteful',
}
