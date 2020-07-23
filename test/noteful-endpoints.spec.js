const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const {
	makeFoldersArray,
	makeMaliciousFolder,
} = require('./folders-fixtures')
const { makeNotesArray, makeBadNote } = require('./notes-fixtures')
const { expect } = require('chai')

describe('Folders Endpoints', () => {
	let db
	db = knex({
		client: 'pg',
		connection: process.env.TEST_DATABASE_URL,
	})
	app.set('db', db)

	after('disconnect from db', () => db.destroy())
	before('clean the table', () =>
		db.raw(
			`TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE`
		)
	)
	afterEach('cleanup', () =>
		db.raw(
			`TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE`
		)
	)

	describe('GET /api/folders', () => {
		describe('Given no folders', () => {
			it('should respond 200 and an empty list', () => {
				return supertest(app)
					.get('/api/folders')
					.expect(200, [])
			})
		})
		describe('Given there are folders in the database', () => {
			const testFolders = makeFoldersArray()
			const testNotes = makeNotesArray()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(testNotes)
					})
			})
			it('should respond 200 and all the folders', () => {
				return supertest(app)
					.get('/api/folders')
					.expect(200, testFolders)
			})
		})
		describe('Given there is an XSS attack', () => {
			const {
				maliciousFolder,
				expectedFolder,
			} = makeMaliciousFolder()

			beforeEach('insert malicious article', () => {
				return db('noteful_folders').insert(maliciousFolder)
			})

			it('should remove the xss attack', () => {
				return supertest(app)
					.get(`/api/folders`)
					.expect(200)
					.expect((res) => {
						expect(res.body[0].folder_name).to.eql(
							expectedFolder.folder_name
						)
					})
			})
		})
	})

	describe('GET /api/folders/:id', () => {
		const testFolders = makeFoldersArray()
		const testNotes = makeNotesArray()

		beforeEach('insert test folders', () => {
			return db
				.into('noteful_folders')
				.insert(testFolders)
				.then(() => {
					return db.into('noteful_notes').insert(testNotes)
				})
		})
		it('should respond 404 if given invalid folder id', () => {
			const id = 9990
			return supertest(app)
				.post(`/api/folders/${id}`)
				.expect(404, {
					error: { message: `Folder does not exist` },
				})
		})
		it('should return 200 and the correct folder', () => {
			const { id } = testFolders[0]
			return supertest(app)
				.get(`/api/folders/${id}`)
				.expect(200, testFolders[0])
		})
	})

	describe('POST /api/folders', () => {
		it('should create a new folder, responding with a 201 and the created folder', () => {
			const newFolder = {
				folder_name: 'Brand new name',
			}
			return supertest(app)
				.post('/api/folders')
				.send(newFolder)
				.expect(201)
				.expect((res) => {
					expect(res.body.folder_name).to.eql(
						newFolder.folder_name
					)
					expect(res.body).to.have.property('id')
				})
		})
		it('should send a 400 status if no folder_name is given', () => {
			const newFolder = { folder_name: '' }

			return supertest(app)
				.post('/api/folders')
				.send(newFolder)
				.expect(400, {
					error: {
						message: `Folders must have a folder name`,
					},
				})
		})
	})

	describe('DELETE /api/folders/:id', () => {
		context('Given no folders', () => {
			it('should respond 404 when id is invalid', () => {
				const id = 99909
				return supertest(app)
					.delete(`/api/folders/${id}`)
					.expect(404, {
						error: { message: `Folder does not exist` },
					})
			})
		})
		describe('Given there are folders in the database', () => {
			const testFolders = makeFoldersArray()
			const testNotes = makeNotesArray()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(testNotes)
					})
			})
			it('should respond 204 and the folder is deleted', () => {
				const { id } = testFolders[0]
				const expectedFolders = testFolders.filter(
					(folder) => folder.id !== id
				)
				return supertest(app)
					.delete(`/api/folders/${id}`)
					.expect(204)
					.then((res) => {
						return supertest(app)
							.get('/api/folders')
							.expect(expectedFolders)
					})
			})
		})
	})

	describe('PATCH /api/folders/:id', () => {
		context(`Given no folders`, () => {
			it(`responds with 404`, () => {
				const id = 9909
				return supertest(app)
					.patch(`/api/folders/${id}`)
					.expect(404, {
						error: { message: `Folder does not exist` },
					})
			})
		})
		describe('Given folders in the database', () => {
			const testFolders = makeFoldersArray()
			const testNotes = makeNotesArray()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(testNotes)
					})
			})
			it('should respond 204 and the updates  the folder', () => {
				const { id } = testFolders[0]
				const updatedFolder = {
					folder_name: 'Updated Folder Name',
				}
				const expectedFolder = {
					...testFolders[0],
					folder_name: updatedFolder.folder_name,
				}

				return supertest(app)
					.patch(`/api/folders/${id}`)
					.send(updatedFolder)
					.expect(204)
					.then((res) => {
						return supertest(app)
							.get(`/api/folders/${id}`)
							.expect(expectedFolder)
					})
			})
			it('should respond 400 when folder name is empty or not provided', () => {
				const { id } = testFolders[0]
				return supertest(app)
					.patch(`/api/folders/${id}`)
					.send({ folder_name: '' })
					.expect(400, {
						error: {
							message:
								'Folder must contain a valid folder name',
						},
					})
			})
		})
	})
})
describe('Notes Endpoints', () => {
	let db
	db = knex({
		client: 'pg',
		connection: process.env.TEST_DATABASE_URL,
	})
	app.set('db', db)

	after('disconnect from db', () => db.destroy())
	before('clean the table', () =>
		db.raw(
			`TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE`
		)
	)
	afterEach('cleanup', () =>
		db.raw(
			`TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE`
		)
	)

	describe('GET /api/notes', () => {
		context('Given no notes', () => {
			it('should respond with an empty array', () => {
				return supertest(app)
					.get('/api/notes')
					.expect(200, [])
			})
		})

		describe('Given notes in the database', () => {
			const testFolders = makeFoldersArray()
			const testNotes = makeNotesArray()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(testNotes)
					})
			})
			it('should respond 200 and all the notes', () => {
				return supertest(app)
					.get('/api/notes')
					.expect(200, testNotes)
			})
		})
	})
	describe('GET /api/notes/:id', () => {
		context('Given a xss attack', () => {
			const testFolders = makeFoldersArray()
			const { badNote, expectedNote } = makeBadNote()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(badNote)
					})
			})

			it('should remove the xss attack', () => {
				const id = 1
				return supertest(app)
					.get(`/api/notes/${id}`)
					.expect(200, { ...expectedNote, id })
			})
		})
		describe('Given notes in the database', () => {
			const testFolders = makeFoldersArray()
			const testNotes = makeNotesArray()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(testNotes)
					})
			})
			it('should return 200 and the given note', () => {
				const { id } = testNotes[0]
				return supertest(app)
					.get(`/api/notes/${id}`)
					.expect(200, testNotes[0])
			})
			it('should respond 404 given invalid id', () => {
				const id = 99009
				return supertest(app)
					.get(`/api/notes/${id}`)
					.expect(400, {
						error: { message: `Note does not exist` },
					})
			})
		})
	})

	describe('POST /api/notes', () => {
		context('Given no notes in the database', () => {
			const testFolders = makeFoldersArray()

			beforeEach('insert test folders', () => {
				return db.into('noteful_folders').insert(testFolders)
			})
			it('should respond 201 and posted note', () => {
				const note = {
					note_name: 'New Note',
					folder_id: 1,
					content: 'Test Content',
					modified: `2020-01-22T16:28:32.615Z`,
				}
				const expectedNote = {
					...note,
					id: 1,
				}
				return supertest(app)
					.post('/api/notes')
					.send(note)
					.expect(201)
					.then((res) => {
						return supertest(app)
							.get('/api/notes')
							.expect([expectedNote])
					})
			})
			it('should respond 400 when given empty field', () => {
				const note = {
					note_name: 'New Note',
					folder_id: 1,
					content: '',
					modified: `2020-01-22T16:28:32.615Z`,
				}
				return supertest(app)
					.post('/api/notes')
					.send(note)
					.expect(400)
			})
		})
	})

	describe('DELETE /api/notes/:id', () => {
		context('Given no notes', () => {
			it('should respond 400', () => {
				const id = 99009
				return supertest(app)
					.get(`/api/notes/${id}`)
					.expect(400, {
						error: { message: `Note does not exist` },
					})
			})
		})
		context('Given notes in the database', () => {
			const testFolders = makeFoldersArray()
			const testNotes = makeNotesArray()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(testNotes)
					})
			})
			it('should respond 204 and removes the note', () => {
				const { id } = testNotes[0]
				const expectedNotes = testNotes.filter(
					(note) => note.id !== id
				)
				return supertest(app)
					.delete(`/api/notes/${id}`)
					.expect(204)
					.then((res) => {
						return supertest(app)
							.get(`/api/notes/${id}`)
							.expect(400, {
								error: {
									message: `Note does not exist`,
								},
							})
					})
					.then((res) => {
						return supertest(app)
							.get('/api/notes')
							.expect(expectedNotes)
					})
			})
		})
	})

	describe('PATCH /api/notes/:id', () => {
		describe('Given no notes in the database', () => {
			it('should respond with 400 bad request, invalid id', () => {
				const id = 99909
				return supertest(app)
					.patch(`/api/notes/${id}`)
					.expect(400, {
						error: { message: `Note does not exist` },
					})
			})
		})
		describe('Given notes in the database', () => {
			const testFolders = makeFoldersArray()
			const testNotes = makeNotesArray()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(testNotes)
					})
			})
			it('should respond 204 and the article is updated', () => {
				const { id } = testNotes[0]
				const newFields = {
					content: 'Hey, check it out : New Content!',
					note_name: 'I wanted a new name',
					folder_id: 2,
				}
				const expectedNote = {
					...testNotes[0],
					...newFields,
				}

				return supertest(app)
					.patch(`/api/notes/${id}`)
					.send(newFields)
					.expect(204)
					.then((res) => {
						return supertest(app)
							.get(`/api/notes/${id}`)
							.expect(expectedNote)
					})
			})
			it(`responds with 400 when no required fields supplied`, () => {
				const { id } = testNotes[0]
				const newFields = {
					content: 'Hey, check it out : New Content!',
				}
				return supertest(app)
					.patch(`/api/notes/${id}`)
					.send(newFields)
					.expect(400)
			})
		})
		describe('Given an xss attack', () => {
			const testFolders = makeFoldersArray()
			const { badNote, expectedNote } = makeBadNote()

			beforeEach('insert test folders', () => {
				return db
					.into('noteful_folders')
					.insert(testFolders)
					.then(() => {
						return db
							.into('noteful_notes')
							.insert(badNote)
					})
			})
			it('should remove a xss attack', () => {
				const id = 1
				return supertest(app)
					.get(`/api/notes/${id}`)
					.expect(200, { ...expectedNote, id })
			})
		})
	})
})
