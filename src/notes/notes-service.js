const NotesService = {
	getAllNotes(db) {
		return db('noteful_notes').select('*')
	},
	insertNote(db, newNote) {
		return db
			.insert(newNote)
			.into('noteful_notes')
			.returning('*')
			.then((rows) => {
				return rows[0]
			})
	},
	getById(db, id) {
		return db('noteful_notes').select('*').where({ id }).first()
	},
	deleteNote(db, id) {
		return db('noteful_notes').where({ id }).delete()
	},
	patchNote(db, id, newNote) {
		return db('noteful_notes').where({ id }).update(newNote)
	},
}

module.exports = NotesService
