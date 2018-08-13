const fs = require('fs');
const path = require('path');
const authService = require('../../../services/auth.service');
const {validationResult} = require('express-validator/check');
const {parseCsvFile} = require('../services/parsing');

const Card = require('../models/Card');
const CardFile = require('../models/CardFile');

const CardFilesController = () => {

	const getSchema = () => {
		const idRule = {
			in          : ['params'],
			isInt       : true,
			toInt       : true,
			errorMessage: 'Значение идентификатора должно быть числом.',
		};

		return {
			list      : {
				id: idRule
			},
			remove    : {
				id     : idRule
			},
			operations: {
				id     : idRule,
				file_id: idRule
			},
			upload    : {
				id: idRule
			}
		};
	};

	const getUploads = () => {
		return {
			operations: {
				path: '/transactions',
				file: 'operations'
			},
		};
	};

	const list = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			records = [],
			card;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;
				card = await Card.getUserCardById(id, user.id);

				if (card) {
					const data = await CardFile.scope({method: ['byCard', card.id]}).findAll();
					records = data.map(record => record.getJSON({fields: ['destination', 'originalName'], exclude: true}));
					success = true;
				}
				else {
					message = 'Card not found';
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to load data: ' + e.toString();
		}

		return res.json({records, success, message, errors});
	};

	const remove = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			file = null,
			card = null,
			notFound = 'File have not found';

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;

				file = await CardFile.findById(id);
				card = await Card.getUserCardById(file.card_id || 0, user.id);

				if (file && card) {
					fs.unlink(file.destination + '/' + file.filename);
					file.destroy();
					success = true;
				} else {
					message = notFound;
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to remove file: ' + e.toString();
		}

		return res.json({success, message, errors});
	};

	const operations = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			cardFile = null,
			card = null,
			data = {};

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id, file_id} = req.params;

				card = await Card.getUserCardById(id, user.id);
				if (card) {

					cardFile = await CardFile.scope({method: ['byCard', card.id]}).findById(file_id);

					if (cardFile) {
						const file = {
							path: path.join(cardFile.destination, cardFile.filename)
						};
						data = await parseCsvFile(file);
						success = true;
					}
					else {
						message = 'File not found';
					}
				}
				else {
					message = 'Card not found';
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to save data: ' + e.toString();
		}

		return res.json({data, success, message, errors});
	};

	/**
	 * Метод загрузки файла с операциями и первоначального его разбора.
	 * @param req Request
	 * @param res
	 * @returns {Sequelize.json|*}
	 */
	const uploadFile = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			data = {},
			card = null,
			cardFile = null,
			item = null;

		const file = req.file;

		try {

			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;
				card = await Card.getUserCardById(id, user.id);

				if (card) {
					// data = await parseCsvFile(file);
					const {filename, originalname, size, destination, mimetype} = file;

					cardFile = await CardFile.create({
						filename,
						destination,
						size,
						originalName: originalname,
						mimeType    : mimetype,
						card_id     : card.id
					});

					item = cardFile.getJSON({fields: ['destination', 'originalName'], exclude: true});

					success = true;
				}
				else {
					message = 'Card not found';
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Ошибка разбора файла с данными.';
		}

		return res.status(200).json({item, success, message, errors});
	};

	return {
		list,
		remove,
		operations,
		uploadFile,
		getUploads,
		getSchema
	};
};

module.exports = CardFilesController;
