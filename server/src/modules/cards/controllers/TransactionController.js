const authService = require('../../../services/auth.service');
const {validationResult} = require('express-validator/check');
const {remUndefined, addOptionals, parseDate} = require('../../../utils/helpers');
const moment = require('moment');
const validator = require('validator');

const Card = require('../models/Card');
const CardFile = require('../models/CardFile');
const Pattern = require('../../categories/models/Pattern');
const Transaction = require('../models/Transaction');
const Category = require('../../categories/models/Category');
const UserCategory = require('../models/UserCategory');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const TransactionController = () => {

	const getSchema = () => {

		const idRule = {
			in          : ['params'],
			isInt       : true,
			toInt       : true,
			errorMessage: 'Значение идентификатора должно быть числом.',
		};

		const fullRule = {
			in      : ['body'],
			optional: true,
			isLength: {
				options     : {min: 1, max: 254,},
				errorMessage: 'Длина поля описание должна быть от 5 до 254 символов.',
			},
			trim    : true
		};

		const shortRule = {
			in      : ['body'],
			optional: true,
			isLength: {
				options     : {min: 1, max: 20,},
				errorMessage: 'Длина поля названия должна быть от 5 до 20 символов.',
			},
			trim    : true
		};

		const typeRule = {
			in   : ['body'],
			isInt: true,
			isIn : {
				options     : [[0, 1]],
				errorMessage: 'Неправильно указан тип операции.',
			},
			toInt: true,
		};

		const iddateRule = {
			in             : ['body'],
			isISO8601      : {
				errorMessage: 'Неверный формат даты.',
			},
			trim           : true,
			customSanitizer: {
				options: (value) => {
					return parseDate(value, 'YYYY-MM-DD');
				}
			},
		};

		const amountRule = {
			in       : ['body'],
			isDecimal: {
				errorMessage: 'Значение поля сумма должно быть числом.',
			}
		};

		const baseRules = {
			full  : fullRule,
			short : shortRule,
			type  : typeRule,
			iddate: iddateRule,
			amount: amountRule
		};

		return {
			list       : {
				card_id: {...idRule, in: ['query']},
				start  : {...iddateRule, in: ['query'], optional: true},
				end    : {...iddateRule, in: ['query'], optional: true},
			},
			add        : {
				...baseRules,
				card    : {...idRule, in: ['body']},
				category: {...idRule, in: ['body'], optional: true},
			},
			update     : {
				id      : idRule,
				...addOptionals(baseRules),
				card    : {...idRule, in: ['body']},
				category: {...idRule, in: ['body'], optional: true},
			},
			remove     : {
				id: idRule
			},
			removeRange: {
				card : {...idRule, in: ['body']},
				start: iddateRule,
				end  : iddateRule,
			},
			upload     : {
				card            : {...idRule, in: ['body']},
				file            : {...idRule, in: ['body']},
				'opers.*.type'  : typeRule,
				'opers.*.iddate': iddateRule,
				'opers.*.full'  : fullRule,
				'opers.*.amount': amountRule,
			},
			sync       : {
				card : {...idRule, in: ['body']},
				start: iddateRule,
				end  : iddateRule
			}
		};
	};

	const saveTransaction = async (req, isNew = true) => {
		let success = false,
			message = '',
			record = null,
			errors = [],
			oper = null,
			payload = null;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const {short, full, type, iddate, amount, card, category} = req.body;
				const cardItem = await Card.getUserCardById(card, user.id);

				if (cardItem) {

					let diff = 0;

					if (isNew) {
						oper = await Transaction.create({
							short,
							full,
							type,
							iddate,
							amount,
							card_id    : card,
							category_id: category || null
						});

						diff = oper.getAmountByType();
					}
					else {
						const {id} = req.params;
						oper = await Transaction.findById(id);
						if (oper) {
							if (amount) {
								const value = parseFloat(amount) - oper.amount;
								diff = oper.isIncome() ? value : -1 * value;
							}

							const cat_id = category !== 0 ? category : null;

							await oper.update(remUndefined({
								short,
								full,
								type,
								iddate,
								amount,
								card_id    : card,
								category_id: cat_id
							}, true));
						}
						else {
							message = 'Transaction not found';
						}
					}

					if (oper) {

						if (diff !== 0) {
							cardItem.total = cardItem.total + diff;
							await cardItem.save();
						}

						payload = {
							total  : cardItem.total,
							opCount: await Transaction.getCountByCard(cardItem.id)
						};

						record = oper.getJSON({aliases: {card_id: 'card', category_id: 'category'}});
						success = true;
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

		return {success, message, record, payload, errors};
	};

	function getCreditDebet(transactions) {
		let debet = 0,
			credit = 0;

		transactions.forEach(item => {
			if (item.type === Transaction.OUTCOME) {
				credit += parseFloat(item.amount);
			}
			if (item.type === Transaction.INCOME) {
				debet += parseFloat(item.amount);
			}
		});

		return {
			debet,
			credit,
			diff: debet - credit
		}
	}

	/**
	 * Find categories for transactions using patterns.
	 * @param userId integer
	 * @param cardId integer
	 * @param opers array
	 * @returns {Promise.<Array.<Model>>}
	 */
	async function findTransactionCategory(userId, cardId, opers) {
		let opersWithCats = [];

		const patterns = await Pattern.findAll({
			attributes: ['id', 'search', 'category', 'category_id'],
			include   : [{
				model     : Category,
				attributes: ['id'],
				include   : [{
					model: UserCategory,
					as   : 'userCategory',
					where: {
						user_id: userId
					}
				}]
			}]
		});

		for (let i = 0; i < opers.length; i++) {
			let oper = {...opers[i]};
			for (let j = 0; j < patterns.length; j++) {
				const pattern = patterns[j];
				const full = oper.full.toLowerCase();

				if (full.length !== 0 && full.indexOf(pattern.search.toLowerCase()) !== -1) {
					oper.category_id = parseInt(pattern.category_id);
					break;
				}
			}

			// set card number
			oper.card_id = cardId;

			opersWithCats.push(oper);
		}

		return opersWithCats;
	}

	/**
	 * Check transaction existing.
	 * @param oper object
	 * @param userCards array
	 * @returns {Promise.<boolean>}
	 */
	async function checkTransaction(oper, userCards) {
		const transaction = await Transaction.findOne({
			where: {
				...oper
			}
		});
		return transaction && userCards.find(item => item.id = transaction.card_id);
	}

	/**
	 * Public methods
	 */

	const list = async (req, res) => {
		let success = false,
			message = '',
			records = [];

		const user = authService.getUser(req);
		const validation = await validationResult(req);

		try {

			if (!validation.isEmpty()) {
				console.log('Errors', validation.array());
				return res.json({success, message, records, errors: validation.array()});
			}

			const startDefault = moment().add(-7, 'days').format('YYYY-MM-DD');
			const endDefault = moment().add(1, 'days').format('YYYY-MM-DD');
			const {card_id = 0, start = startDefault, end = endDefault} = req.query;

			const card = await Card.getUserCardById(card_id, user.id);

			if (card) {
				const data = await Transaction
					.scope(
						{method: ['byCard', card_id]},
						{method: ['byPeriod', start, end]}
					)
					.findAll({
						order: [
							['iddate', 'ASC'],
							['id', 'ASC'],
						]
					});

				records = data.map(record => record.getJSON({aliases: {category_id: 'category'}}));
				success = true;
			}
			else {
				message = 'Card not found';
			}
		}
		catch (e) {
			message = e.toString();
		}

		return res.json({success, message, records});
	};

	const add = async (req, res) => {
		const {success, message, record, payload, errors} = await saveTransaction(req, true);
		return res.json({success, message, record, payload, errors});
	};

	const update = async (req, res) => {
		const {success, message, record, payload, errors} = await saveTransaction(req, false);
		return res.json({success, message, record, payload, errors});
	};

	const remove = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			payload = null;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;

				const transaction = await Transaction.findOne({
					include: [{
						attributes: ['id'],
						model     : Card,
						as        : 'card'
					}],
					where  : {
						id: id
					}
				});

				const card = transaction ? transaction.card.id : 0;
				const cardItem = await Card.getUserCardById(card, user.id);

				if (cardItem && transaction) {

					const diff = transaction.getAmountByType();
					transaction.destroy();

					payload = {
						total  : cardItem.total - diff,
						opCount: await Transaction.getCountByCard(cardItem.id)
					};

					cardItem.total = payload.total.toFixed(2);
					await cardItem.save();

					success = true;
				}
				else {
					message = 'Transaction not found';
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to save data: ' + e.toString();
		}

		return res.json({success, message, errors, payload});
	};

	const removeRange = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			removed = 0,
			payload = null;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {card = 0, start, end} = req.body;
				const cardItem = await Card.getUserCardById(card, user.id);

				if (cardItem && start && end) {

					const startDate = moment(start).format('YYYY-MM-DD');
					const endDate = moment(end).add(1, 'days').format('YYYY-MM-DD');

					const condition = {
						where: {
							card_id: card,
							iddate : {
								[Op.between]: [startDate, endDate]
							},
						}
					};

					const willRemoved = await Transaction.findAll(condition);
					const dc = getCreditDebet(willRemoved);

					removed = await Transaction.destroy(condition);

					cardItem.total = cardItem.total - dc.diff;
					await cardItem.save();

					payload = {
						opCount: await Transaction.getCountByCard(cardItem.id),
						total  : parseFloat(cardItem.total.toFixed(2))
					};

					success = true;
				}
				else {
					message = 'Transactions not found';
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to save data: ' + e.toString();
		}

		return res.json({removed, payload, success, message, errors});
	};

	const upload = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			existOpers = [],
			notExists = [],
			records = [],
			payload = null;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const {card, file, opers} = req.body;
				const userCards = await Card.getUserCards(user.id);
				const cardItem = await Card.getUserCardById(card, user.id);
				const fileItem = await CardFile.scope({method: ['byCard', cardItem ? cardItem.id : 0]}).findById(file);

				if (cardItem && fileItem) {

					const opersWithCats = await findTransactionCategory(user.id, card, opers);

					for (let i = 0; i < opersWithCats.length; i++) {
						if (await checkTransaction(opersWithCats[i], userCards)) {
							existOpers.push(opersWithCats[i]);
						} else {
							notExists.push(remUndefined(opersWithCats[i]));
						}
					}

					if (notExists.length > 0) {
						records = await Transaction.bulkCreate(notExists);

						// Check that created records count equal not existed records
						// And update total
						let dc = getCreditDebet(records);

						cardItem.total = cardItem.total + dc.diff;
						await cardItem.save();

						payload = {
							opCount: await Transaction.getCountByCard(cardItem.id),
							total  : parseFloat(cardItem.total.toFixed(2))
						};
					}

					// Mark that file is saved
					await fileItem.update({isSaved: CardFile.IS_SAVED});

					success = true;
				}
				else {
					message = 'Card or File not found';
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to save data: ' + e.toString();
		}

		const data = {
			add   : records,
			exists: existOpers,
		};

		return res.json({data, payload, success, message, errors});
	};

	const sync = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			records = [],
			payload = null;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const {card, start, end} = req.body;

				const opers = await Transaction
					.scope('withoutCategory', {method: ['byPeriod', start, end]})
					.findAll({
						attributes: ['id', 'full', 'category_id', 'iddate'],
						include   : [{
							model: Card,
							as   : 'card',
							where: {
								id     : card,
								user_id: user.id
							},
						}]
					});

				// Find categories for transactions
				const operObjects = opers.map(item => item.get());
				const checkedOpers = await findTransactionCategory(user.id, card, operObjects);
				const opersWithCats = checkedOpers.filter(item => item.category_id !== null);

				for (let i = 0; i < opersWithCats.length; i++) {
					try {
						const item = opersWithCats[i];
						await Transaction.update({category_id: item.category_id}, {where: {id: item.id}});
						const {id, category_id} = item;
						records.push({id, category: category_id});
					} catch (e) {
						console.log('Error to update transaction E: ' + e.toString());
					}
				}

				payload = {
					find   : opersWithCats.length,
					updated: records.length
				};

				success = true;
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to save data: ' + e.toString();
		}

		return res.json({records, payload, success, message, errors});
	};

	return {
		list,
		add,
		update,
		remove,
		removeRange,
		upload,
		sync,

		getSchema
	};
};

module.exports = TransactionController;
