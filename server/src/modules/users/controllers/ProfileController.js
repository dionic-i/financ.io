/**
 * Description of ProfileController.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 04.07.18 14:14
 */
const authService = require('../../../services/auth.service');
const {validationResult} = require('express-validator/check');
const {remUndefined, parseDate} = require('../../../utils/helpers');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');


const ProfileController = () => {

	const getSchema = () => {
		const baseRules = {
			firstname : {
				in      : ['body'],
				optional: true,
				isLength: {
					options     : {min: 3, max: 50,},
					errorMessage: 'Длина поля названия должна быть от 3 до 50 символов.',
				},
				trim    : true,
			},
			secondname: {
				in      : ['body'],
				optional: true,
				isLength: {
					options     : {min: 3, max: 50,},
					errorMessage: 'Длина поля описание должна быть от 3 до 50 символов.',
				},
				trim    : true,
			},
			birthday  : {
				in             : ['body'],
				optional       : true,
				isISO8601      : {
					errorMessage: 'Неверный формат даты.',
				},
				trim           : true,
				customSanitizer: {
					options: (value) => {
						return value ? parseDate(value, 'YYYY-MM-DD') : null;
					}
				},
			}
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
			},
			settings: {
				id: idRule
			}
		};
	};

	const getUploads = () => {
		return {
			upload: {
				file: 'avatars'
			},
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

	const saveProfile = async (req, onlySettings = false) => {
		let success = false,
			message = '',
			record = null,
			errors = [],
			profile;

		try {
			const user = authService.getUser(req);
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				let values;
				profile = await UserProfile.findOne({where: {id: user.profile_id}});

				if (!onlySettings) {
					const {firstname = null, secondname = null, birthday = null} = req.body;
					values = remUndefined({firstname, secondname, birthday}, true);
				}
				else {
					values = {settings: req.body.settings};
				}

				if (profile) {
					profile.update(values);
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

		return {success, message, record, errors};
	};

	const save = async (req, res) => {
		const {success, message, record, errors} = await saveProfile(req);
		return res.json({success, message, record, errors});
	};

	const saveSettings = async (req, res) => {
		const {success, message, record, errors} = await saveProfile(req, true);
		return res.json({success, message, record, errors});
	};

	/**
	 * Avatar upload method.
	 * @param req Request
	 * @param res
	 * @returns {Sequelize.json|*}
	 */
	const uploadAvatar = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			item = null,
			status = 200;

		const file = req.file;

		try {

			const user = authService.getUser(req);
			const profile = await UserProfile.findOne({where: {id: user.profile_id}});

			if (profile) {
				const {filename} = file;
				await profile.update({avatar: filename});
				item = profile.getJSON();
				success = true;
			}
			else {
				status = 404;
				message = 'Profile not found';
			}

		}
		catch (e) {
			message = 'Ошибка загрузки аватарки.';
		}

		return res.status(status).json({item, success, message, errors});
	};

	/**
	 * Avatar remove method.
	 * @param req Request
	 * @param res
	 * @returns {Sequelize.json|*}
	 */
	const removeAvatar = async (req, res) => {
		let success = false,
			message = '',
			errors = [],
			item = null,
			status = 200;

		try {
			const user = authService.getUser(req);
			const profile = await UserProfile.findOne({where: {id: user.profile_id}});
			if (profile) {
				await profile.update({avatar: null});
				item = profile.getJSON();
				success = true;
			}
			else {
				status = 404;
				message = 'Profile not found';
			}
		}
		catch (e) {
			message = 'Ошибка загрузки аватарки.';
		}

		return res.status(status).json({item, success, message, errors});
	};


	return {
		load,
		save,
		saveSettings,
		uploadAvatar,
		removeAvatar,

		getSchema,
		getUploads
	};
};

module.exports = ProfileController;
