/**
 * Description of ReportController.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 12.07.18 9:54
 */
const authService = require('../../../services/auth.service');
const {validationResult} = require('express-validator/check');


const DashboardController = () => {

	const getSchema = () => {
		const idRule = {
			in          : ['get'],
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
			categoriesAmount: {
				'categories.*.id': idRule,
				'cards.*.id'     : idRule,
				start            : iddateRule,
				end              : iddateRule
			},
			cardsAmount     : {
				'cards.*.id': idRule,
				start       : iddateRule,
				end         : iddateRule
			}
		};
	};

	const categoriesAmountReport = async (req, res) => {
		let success = false,
			message = '',
			errors,
			records = [];

		try {
			const validation = await validationResult(req);
			const user = authService.getUser(req);
			const dataLoader = req.app.get('dataLoader');

			if (validation.isEmpty()) {

				const {cards, categories, start, end} = req.query;

				const params = {
					cards     : cards || [0],
					categories: categories || [0],
					begdate   : start,
					enddate   : end,
					user_id   : user.id
				};

				const data = await dataLoader.query('CategoriesAmountByMonth', params);
				records = data.map(item => {
					const {id, iddate, amount} = item;
					return {id, iddate, amount: parseFloat(amount)};
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

	const cardsAmountReport = async (req, res) => {
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

				const data = await dataLoader.query('CardsAmountByMonth', params);
				records = data.map(item => {
					const {id, iddate, income, outcome, saldo} = item;
					return {
						id,
						iddate,
						income : parseFloat(income),
						outcome: parseFloat(outcome),
						saldo  : parseFloat(saldo)
					};
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
		categoriesAmountReport,
		cardsAmountReport,
		getSchema
	};
};

module.exports = DashboardController;
