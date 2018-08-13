/**
 * Description of DashboardController.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 27.06.18 14:04
 */

const authService = require('../../../services/auth.service');
const {validationResult} = require('express-validator/check');

const DashboardController = () => {

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

		const iddateRule = {
			in             : ['get'],
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

		return {
			list  : {
				id: idRule
			},
			add   : {
				name    : nameRule,
				search  : searchRule,
				category: {...categoryRule}
			},
			update: {
				id      : idRule,
				name    : {...nameRule, optional: true},
				search  : {...searchRule, optional: true},
				category: {...categoryRule, optional: true}
			},
			remove: {
				id: idRule
			},
			amount: {
				'cards.*.id': {...idRule, in: ['body']},
				start       : iddateRule,
				end         : iddateRule
			}
		};
	};

	const amountsByCategory = async (req, res) => {
		let success = false,
			message = '',
			errors,
			records = [];

		try {
			const validation = await validationResult(req);
			const user = authService.getUser(req);
			const dataLoader = req.app.get('dataLoader');

			if (validation.isEmpty()) {

				const {cards, start, end} = req.query;

				const params = {
					cards  : cards,
					begdate: start,
					enddate: end,
					user_id: user.id
				};

				const data = await dataLoader.query('TransactionsByCategories', params);
				records = data.map(item => {
					const {id, name, amount} = item;
					return {id, name, amount: parseFloat(amount)};
				});

				success = true;

			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = e.toString();
		}

		return res.json({records, success, message, errors});
	};

	return {
		amountsByCategory,
		getSchema
	};
};

module.exports = DashboardController;
