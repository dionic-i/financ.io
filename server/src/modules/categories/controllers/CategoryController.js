const authService = require('../../../services/auth.service');
const sequelize = require('../../../../config/database');
const Category = require('../models/Category');
const Pattern = require('../models/Pattern');
const UserCategory = require('../../cards/models/UserCategory');
const {validationResult} = require('express-validator/check');


const CategoryController = () => {

	const getSchema = () => {
		const baseRules = {
			name: {
				in      : ['body'],
				isLength: {
					options     : {min: 3, max: 20,},
					errorMessage: 'Длина поля названия должна быть от 3 до 20 символов.',
				},
				trim    : true
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
				id: idRule,
				...baseRules
			},
			remove: {
				id: idRule
			},
			check: {
				id: idRule
			}
		};
	};

	const saveCategory = async (req, isNew = true) => {
		let success = false,
			message = '',
			record = null,
			errors = [],
			category,
			userCategory,
			transaction;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const {name} = req.body;

				if (isNew) {
					try {
						transaction = await sequelize.transaction();
						category = await Category.create({name});
						userCategory = await UserCategory.create({user: user.id, category: category.id, category_id: category.id});
						await transaction.commit();
					} catch (e) {
						await transaction.rollback();
						message = 'Error to save data: ' + e.toString();
					}
				}
				else {
					const {id} = req.params;

					category = await Category
						.findOne({
							attributes: ['id', 'name'],
							include   : [{
								attributes: ['id'],
								model     : UserCategory,
								as        : 'userCategory',
								where     : {user_id: user.id},
							}],
							where: {
								id: id
							}
						});

					if (category) {
						category.update({name});
					}
				}

				if (category) {
					record = category.getJSON({fields: ['id', 'name']});
					success = true;
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
			records = await Category
				.findAll({
					attributes: ['id', 'name'],
					include   : [{
						attributes: ['id'],
						model     : UserCategory,
						as        : 'userCategory',
						where     : {user_id: user.id},
					}],
					order: [
						['id', 'ASC']
					]
				});

			records = records.map(item => item.getJSON({fields: ['id', 'name']}));

			success = true;
		}
		catch (e) {
			message = e.toString();
		}

		return res.json({success, message, records});
	};

	const add = async (req, res) => {
		const {success, message, record, errors} = await saveCategory(req, true);
		return res.json({success, message, record, errors});
	};

	const update = async (req, res) => {
		const {success, message, record, errors} = await saveCategory(req, false);
		return res.json({success, message, record, errors});
	};

	const remove = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			category;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;

				try {
					transaction = await sequelize.transaction();

					category = await Category
						.findOne({
							attributes: ['id', 'name'],
							include   : [{
								attributes: ['id'],
								model     : UserCategory,
								as        : 'userCategory',
								where     : {user_id: user.id},
								required: false
							}],
							where: {
								id: id
							}
						}, {transaction: transaction});

					if (category) {
						userCategory = await UserCategory.destroy({where: {category: category.id}}, {transaction: transaction});
						await category.destroy({transaction: transaction});
					} else {
						message = 'Category not found';
					}

					await transaction.commit();
					success = true;
				} catch (err) {
					await transaction.rollback();
					throw new Error(err);
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

	const categoryCheckRemove = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			canRemove = false;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {id} = req.params;

				const category = await Category
					.findOne({
						attributes: ['id'],
						include   : [{
							attributes: ['id'],
							model     : UserCategory,
							as        : 'userCategory',
							where     : {user_id: user.id},
						}],
						where: {
							id: id
						}
					});

				if (category) {
					count = await Pattern.count({where: {category_id: id}});
					if (count > 0) {
						message = 'Нельзя удалить категории с привязанными шаблонами.';
					}
					canRemove = count === 0;
					success = true;
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
			message = 'Error to get data: ' + e.toString();
		}

		return res.json({canRemove, success, message, errors});
	};


	return {
		list,
		add,
		update,
		remove,
		categoryCheckRemove,
		getSchema
	};
};

module.exports = CategoryController;
