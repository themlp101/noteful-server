const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = (note) => ({
	id: note.id,
	note_name: xss(note.note_name),
	modified: note.modified,
	content: xss(note.content),
	folder_id: note.folder_id,
})

notesRouter
	.route('/')
	.get((req, res, next) => {
		const knexInstance = req.app.get('db')
		NotesService.getAllNotes(knexInstance)
			.then((notes) => {
				res.json(notes.map(serializeNote))
			})
			.catch(next)
	})
	.post(jsonParser, (req, res, next) => {
		const knexInstance = req.app.get('db')
		const { note_name, content, folder_id, modified } = req.body
		const newNote = { note_name, content, folder_id }

		for (const [key, value] of Object.entries(newNote)) {
			if (
				value === null ||
				value.length === 0 ||
				value === undefined
			) {
				return res.status(400).json({
					error: {
						message: `Missing '${key}' in the note trying to be added`,
					},
				})
			}
		}
		newNote.modified = modified

		NotesService.insertNote(knexInstance, newNote)
			.then((note) => {
				res.status(201)
					.location(`${req.originalUrl}/${note.id}`)
					.json(serializeNote(note))
			})
			.catch(next)
	})

notesRouter
	.route('/:id')
	.all((req, res, next) => {
		const knexInstance = req.app.get('db')
		const { id } = req.params
		NotesService.getById(knexInstance, id)
			.then((note) => {
				if (!note) {
					return res.status(400).json({
						error: { message: `Note does not exist` },
					})
				}
				res.note = note
				next()
			})
			.catch(next)
	})
	.get((req, res, next) => {
		res.json(serializeNote(res.note))
	})
	.delete((req, res, next) => {
		const knexInstance = req.app.get('db')
		const { id } = req.params
		NotesService.deleteNote(knexInstance, id)
			.then((rowsAffected) => {
				res.status(204).end()
			})
			.catch(next)
	})
	.patch(jsonParser, (req, res, next) => {
		const knexInstance = req.app.get('db')
		const { id } = req.params
		const { note_name, content, folder_id, modified } = req.body
		const updatedFields = {
			note_name,
			content,
			folder_id,
		}
		for (const [key, value] of Object.entries(updatedFields)) {
			if (value <= 0 || value === null || value === undefined) {
				return res.status(400).json({
					error: {
						message: `Missing '${key}' in the note trying to be added`,
					},
				})
			}
		}
		updatedFields.modified = modified

		NotesService.patchNote(knexInstance, id, updatedFields)
			.then((rowsAffected) => {
				res.status(204).end()
			})
			.catch(next)
	})

module.exports = notesRouter
