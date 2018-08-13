const authService = require('../../../services/auth.service');
const {validationResult} = require('express-validator/check');
const {remUndefined} = require('../../../utils/helpers');

const Card = require('../models/Card');
const Transaction = require('../models/Transaction');


const CardController = () => {

	const getSchema = () => {
		const baseRules = {
			name : {
				in      : ['body'],
				isLength: {
					options     : {min: 3, max: 20,},
					errorMessage: 'Длина поля названия должна быть от 3 до 20 символов.',
				},
				trim    : true
			},
			desc : {
				in      : ['body'],
				optional: true,
				isLength: {
					options     : {min: 0, max: 100,},
					errorMessage: 'Длина поля описание должна быть от 0 до 100 символов.',
				},
				trim    : true
			},
			type : {
				in   : ['body'],
				isInt: true,
				isIn : {
					options     : [[1, 2]],
					errorMessage: 'Неправильно указан тип карты.',
				},
				toInt: true,
			},
			total: {
				in       : ['body'],
				optional : true,
				isDecimal: {
					errorMessage: 'Значение поля остаток должно быть числом.',
				},
				custom   : {
					options     : (value, {req}) => {
						const v = parseFloat(value);
						return !isNaN(v);
					},
					errorMessage: 'Поле остаток должно быть числом',
				}
			}
		};

		const idRule = {
			in          : ['params'],
			isInt       : true,
			toInt       : true,
			errorMessage: 'Значение идентификатора должно быть числом.',
		};

		return {
			list  : {},
			add   : {...baseRules},
			update: {
				...baseRules,
				id: idRule
			},
			remove: {
				id: idRule
			},
			item  : {
				id: idRule
			},
			check: {
				id: idRule
			}
		};
	};

	const saveCard = async (req, isNew = true) => {
		let success = false,
			message = '',
			record = null,
			errors = [],
			card;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const {name, desc, type, total} = req.body;

				if (isNew) {
					card = await Card.create({
						name,
						desc,
						type,
						total,
						user: user.id,
					});
				}
				else {
					const {id} = req.params;
					card = await Card.scope('isActive', {method: ['toUser', user.id]}).findById(id);

					if (card) {
						card.update(remUndefined({name, desc, type, total}));
					}
				}

				if (card) {
					record = card.getJSON({fields: ['id', 'name', 'type', 'desc', 'total']});
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
			message = 'Error to save data: ' + e.toString();
		}

		return {success, message, record, errors};
	};

	const list = async (req, res) => {
		let success = false,
			message = '',
			records = [];

		const user = authService.getUser(req);

		try {
			records = await Card
				.scope('isActive', {method: ['toUser', user.id]})
				.findAll({
					attributes: ['id', 'name', ['card_type_id', 'type'], 'desc', 'total'],
					order: [['id', 'ASC']]
				});

			success = true;
		}
		catch (e) {
			message = e.toString();
		}

		return res.json({success, message, records});
	};

	const add = async (req, res) => {
		const {success, message, record, errors} = await saveCard(req, true);
		return res.json({success, message, record, errors});
	};

	const update = async (req, res) => {
		const {success, message, record, errors} = await saveCard(req, false);
		return res.json({success, message, record, errors});
	};

	const remove = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			card;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;
				card = await Card.scope('isActive', {method: ['toUser', user.id]}).findById(id);

				if (card) {
					card.destroy();
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
			message = 'Error to save data: ' + e.toString();
		}

		return res.json({success, message, errors});
	};

	const item = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			item = null,
			prev = -1,
			next = -1;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;

				const cards = await Card.scope('isActive', {method: ['toUser', user.id]}).findAll({
					attributes: ['id', 'name', ['card_type_id', 'type'], 'desc', 'total']
				});

				const card = cards.find(item => item.id === id);

				if (card) {
					const current = cards.indexOf(card);
					if (current !== 0) {
						prev = cards[current - 1].id;
					}
					if (current < cards.length - 1) {
						next = cards[current + 1].id;
					}

					item = card.getJSON({fields: ['id', 'name', 'type', 'desc', 'total']});

					const opCount = await Transaction.count({where: {card_id: card.id}});
					item.opCount = opCount || 0;

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
			message = 'Error to save data: ' + e.toString();
		}

		return res.json({item, prev, next, success, message, errors});
	};

	const cardsOperationsCount = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			count = 0;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;
				const card = await Card.getUserCardById(id, user.id);

				if (card) {
					count = await Transaction.count({where: {card_id: card.id}});
					if (count > 0) {
						message = 'Нельзя удалить карту с существующими транзакциями.';
					}
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
			message = 'Error to get data: ' + e.toString();
		}

		return res.json({count, success, message, errors});
	};

	return {
		list,
		add,
		update,
		remove,
		item,
		cardsOperationsCount,

		getSchema
	};
};

module.exports = CardController;
