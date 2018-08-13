const authService = require('../../../services/auth.service');
const {validationResult} = require('express-validator/check');

const Pattern = require('../models/Pattern');
const Category = require('../models/Category');
const UserCategory = require('../../cards/models/UserCategory');
const Card = require('../../cards/models/Card');
const Transaction = require('../../cards/models/Transaction');

const {remUndefined} = require('../../../utils/helpers');


const PatternController = () => {

	const getSchema = () => {

		const nameRule = {
			in      : ['body'],
			isLength: {
				options     : {min: 3, max: 20,},
				errorMessage: 'Длина поля названия должна быть от 3 до 20 символов.',
			},
			trim    : true
		};

		const searchRule = {
			in      : ['body'],
			isLength: {
				options     : {min: 5, max: 100,},
				errorMessage: 'Длина поля описание должна быть от 5 до 100 символов.',
			},
			trim    : true
		};

		const categoryRule = {
			in          : ['body'],
			isInt       : true,
			toInt       : true,
			errorMessage: 'Значение категории не должно быть пустым.',
		};

		const idRule = {
			in          : ['params'],
			isInt       : true,
			toInt       : true,
			errorMessage: 'Значение идентификатора должно быть числом.',
		};

		return {
			list                : {
				id: idRule
			},
			add                 : {
				name    : nameRule,
				search  : searchRule,
				category: {...categoryRule}
			},
			update              : {
				id      : idRule,
				name    : {...nameRule, optional: true},
				search  : {...searchRule, optional: true},
				category: {...categoryRule, optional: true}
			},
			remove              : {
				id: idRule
			},
			addPatternToCategory: {
				name    : nameRule,
				search  : searchRule,
				oper    : {...idRule, in: ['body']},
				category: {...idRule, in: ['body']}
			}
		};
	};

	const savePattern = async (req, isNew = true) => {
		let success = false,
			message = '',
			record = null,
			errors = [],
			pattern;

		async function getCategory(id, user_id) {
			return await Category.findOne({
				include: [{
					model: UserCategory,
					as   : 'userCategory',
					where: {
						user_id: user_id
					}
				}],
				where  : {
					id: id
				}
			});
		}

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const {name, search, category} = req.body;

				if (isNew) {
					const catInstance = await getCategory(category, user.id);

					if (catInstance) {
						pattern = await Pattern.create({
							name,
							search,
							category
						});
					} else {
						message = 'Category not found.';
					}
				}
				else {
					const {id} = req.params;

					pattern = await Pattern
						.findOne({
							attributes: ['id', 'name', 'search', 'category'],
							include   : [{
								model  : Category,
								include: [{
									model: UserCategory,
									as   : 'userCategory',
									where: {
										user_id: user.id
									}
								}]
							}],
							where     : {
								id: id
							}
						});

					if (pattern) {
						if (category && !(await getCategory(category, user.id))) {
							message = 'Category not found.';
							return {success, message, record, errors};
						}
						pattern.update(remUndefined({name, search, category}));
					}
				}

				if (pattern) {
					record = pattern.getJSON({fields: ['id', 'name', 'search', 'category']});
					success = true;
				}
				else {
					message = 'Pattern not found.';
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
			category,
			errors,
			records = [];

		const user = authService.getUser(req);

		try {
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const {id} = req.params;

				category = await Category
					.findOne({
						attributes: ['id'],
						where     : {id: id},
						include   : [{
							model     : Pattern,
							attributes: ['id', 'name', 'search', 'category'],
							as        : 'patterns',
						}, {
							attributes: ['id'],
							model     : UserCategory,
							as        : 'userCategory',
							where     : {user_id: user.id},
						}],
						order     : [
							['patterns', 'id', 'ASC']
						]
					});

				if (category) {
					success = true;
					records = category.patterns.map(item => item.toJSON());
				}
				else {
					message = 'Category not found';
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = e.toString();
		}

		return res.json({success, message, records, errors});
	};

	const add = async (req, res) => {
		const {success, message, record, errors} = await savePattern(req, true);
		return res.json({success, message, record, errors});
	};

	const update = async (req, res) => {
		const {success, message, record, errors} = await savePattern(req, false);
		return res.json({success, message, record, errors});
	};

	const remove = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			pattern;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;

				pattern = await Pattern
					.findOne({
						attributes: ['id'],
						include   : [{
							model  : Category,
							include: [{
								model: UserCategory,
								as   : 'userCategory',
								where: {
									user_id: user.id
								}
							}]
						}],
						where     : {
							id: id
						}
					});

				if (pattern) {
					pattern.destroy();
					success = true;
				}
				else {
					message = 'Pattern not found';
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

	const addPatternToCategory = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			payload = null;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {name, search, category, oper} = req.body;
				const userCategory = await UserCategory.scope({method: ['toUser', user.id]}).findById(category);

				if (userCategory) {

					let pattern = await Pattern.findOne({
						where: {
							search: search
						}
					});

					if (!pattern) {

						pattern = await Pattern.create({
							name,
							search,
							category
						});

						payload = {
							pattern    : pattern.getJSON(),
							transaction: null
						};

						const transaction = await Transaction.findOne({
							include: [{
								model     : Card,
								as        : 'card',
								where     : {user_id: user.id},
							}],
							where  : {
								id: oper
							}
						});

						if (transaction) {
							if (!transaction.category_id) {
								await transaction.update({category_id: category});
							}
							payload.transaction = transaction.getJSON({fields: ['card'], exclude: true, aliases: {category_id: 'category'}});
						}

						success = true;
					}
					else {
						message = `Шаблон ${search} уже существует.`;
					}
				}
				else {
					message = 'Category not found.'
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to save data: ' + e.toString();
		}

		return res.json({payload, success, message, errors});
	};

	return {
		list,
		add,
		update,
		remove,
		addPatternToCategory,
		getSchema
	};
};

module.exports = PatternController;
