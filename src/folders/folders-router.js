const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const folderRouter = express.Router()
const jsonParser = express.json()
const serializeFolder = (folder) => ({
	id: folder.id,
	folder_name: xss(folder.folder_name),
})

folderRouter
	.route('/')
	.get((req, res, next) => {
		const knexInstance = req.app.get('db')
		FoldersService.getAllFolders(knexInstance)
			.then((folders) => {
				res.json(folders.map(serializeFolder))
			})
			.catch(next)
	})
	.post(jsonParser, (req, res, next) => {
		const knexInstance = req.app.get('db')
		const { folder_name } = req.body

		if (!folder_name) {
			return res.status(400).send({
				error: {
					message: `Folders must have a folder name`,
				},
			})
		}
		FoldersService.insertFolder(knexInstance, {
			folder_name,
		}).then((folder) => {
			res.status(201).json(serializeFolder(folder))
		})
	})

folderRouter
	.route('/:id')
	.all((req, res, next) => {
		const { id } = req.params
		const knexInstance = req.app.get('db')
		FoldersService.getById(knexInstance, id)
			.then((folder) => {
				if (!folder) {
					return res.status(404).json({
						error: { message: `Folder does not exist` },
					})
				}
				res.folder = folder
				next()
			})
			.catch(next)
	})
	.get((req, res, next) => {
		res.json(serializeFolder(res.folder))
	})
	.delete((req, res, next) => {
		const knexInstance = req.app.get('db')
		const { id } = req.params
		FoldersService.deleteFolder(knexInstance, id)
			.then((rowsAffected) => {
				res.status(204).end()
			})
			.catch(next)
	})
	.patch(jsonParser, (req, res, next) => {
		const { folder_name } = req.body
		const folderToUpdate = { folder_name }
		const knexInstance = req.app.get('db')
		const { id } = req.params
		if (folder_name.length === 0) {
			return res.status(400).json({
				error: {
					message: `Folder must contain a valid folder name`,
				},
			})
		}
		FoldersService.patchFolder(knexInstance, id, folderToUpdate)
			.then((rowsAffected) => {
				res.status(204).end()
			})
			.catch(next)
	})
module.exports = folderRouter
