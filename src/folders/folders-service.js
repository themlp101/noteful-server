const FoldersService = {
	getAllFolders(db) {
		return db('noteful_folders').select('*')
	},
	insertFolder(db, newFolder) {
		return db('noteful_folders')
			.insert(newFolder)
			.returning('*')
			.then((rows) => {
				return rows[0]
			})
	},
	getById(db, id) {
		return db('noteful_folders').select('*').where({ id }).first()
	},
	deleteFolder(db, id) {
		return db('noteful_folders').where({ id }).delete()
	},
	patchFolder(db, id, updatedFolder) {
		return db('noteful_folders')
			.where({ id })
			.update(updatedFolder)
	},
}

module.exports = FoldersService
