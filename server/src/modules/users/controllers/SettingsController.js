/**
 * Description of SettingsController.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.07.18 8:47
 */

const authService = require('../../../services/auth.service');
const {validationResult} = require('express-validator/check');
const {remUndefined} = require('../../../utils/helpers');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');


const SettingsController = () => {

	const getSchema = () => {
		const baseRules = {
			firstname : {
				in      : ['body'],
				optional: true,
				isLength: {
					options     : {min: 3, max: 20,},
					errorMessage: 'Длина поля названия должна быть от 3 до 20 символов.',
				},
				trim    : true,
			},
			secondname: {
				in      : ['body'],
				optional: true,
				isLength: {
					options     : {min: 3, max: 100,},
					errorMessage: 'Длина поля описание должна быть от 0 до 100 символов.',
				},
				trim    : true,
			},
			birthday  : {
				in             : ['get'],
				optional       : true,
				isISO8601      : {
					errorMessage: 'Неверный формат даты.',
				},
				trim           : true,
				customSanitizer: {
					options: (value) => {
						return parseDate(value, 'YYYY-MM-DD');
					}
				},
			},
		};

		const idRule = {
			in          : ['params'],
			isInt       : true,
			toInt       : true,
			errorMessage: 'Значение идентификатора должно быть числом.',
		};

		return {
			load  : {
				id: idRule
			},
			update: {
				...baseRules,
				id: idRule
			}
		};
	};

	const load = async (req, res) => {
		let success = false,
			message = '',
			record = null;

		try {
			const user = authService.getUser(req);
			profile = await UserProfile.findOne({where: {id: user.profile_id}});
			if (profile) {
				record = profile.getJSON();
				success = true;
			}
			else {
				message = 'Profile not found';
			}
		}
		catch (e) {
			message = 'Error to save data: ' + e.toString();
		}

		return res.status(200).json({success, message, record});
	};

	const save = async (req, res) => {
		let success = false,
			message = '',
			record = null,
			errors = [],
			profile;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const {firstname = null, secondname = null, birthday = null} = req.body;

				profile = await UserProfile.findOne({where: {id: user.profile_id}});

				if (profile) {
					profile.update(remUndefined({firstname, secondname, birthday}, true));
					record = profile.getJSON();
					success = true;
				}
				else {
					message = 'Profile not found';
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = 'Error to save data: ' + e.toString();
		}

		return res.status(200).json({success, message, record, errors});
	};

	return {
		load,
		save,
		getSchema
	};
};

module.exports = SettingsController;
