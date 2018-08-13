const authService = require('../../../services/auth.service');
const bcryptService = require('../../../services/bcrypt.service');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const {validationResult} = require('express-validator/check');
const passport = require('passport');
const {remUndefined, parseDate} = require('../../../utils/helpers');


const UserController = () => {

	const getSchema = () => {

		const passwordRule = {
			in      : ['body'],
			isLength: {
				options     : {min: 6, max: 20},
				errorMessage: 'Длина поля пароль должна быть от 6 до 20 символов.',
			},
			trim    : true
		};

		const emailRule = {
			isEmail: {
				errorMessage: 'Значение поля не является email адресом.',
			},
			trim   : true
		};

		const nameRule = {
			in      : ['body'],
			optional: true,
			isLength: {
				options     : {min: 6, max: 20},
				errorMessage: 'Длина поля должна быть от 6 до 20 символов.',
			},
			trim    : true
		};

		const dateRule = {
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

		return {
			login     : {
				email   : emailRule,
				password: passwordRule
			},
			register  : {
				email     : emailRule,
				password  : passwordRule,
				repassword: passwordRule,
				username  : nameRule,
				firstname : nameRule,
				secondname: nameRule,
				birthday  : dateRule,
			},
			checkEmail: {
				email: emailRule
			}
		};
	};

	const register = async (req, res) => {
		let success = false,
			message = '',
			token = null,
			userData = null,
			errors = [];

		try {
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const {email, password, repassword, username, firstname, secondname, birthday} = req.body;

				if (password !== repassword) {
					message = 'Пароль и подтверждение пароля не совпадают';
					return res.status(200).json({message, success});
				}

				// Create profile
				const profile = await UserProfile.create(remUndefined({
					username, firstname, secondname, birthday
				}));

				// Create user
				await User.create({
					email,
					password,
					profile_id: profile.id
				});

				// Load user again with profile
				const user = await User.findOne({
					include: [{
						model: UserProfile,
						as   : 'profile'
					}],
					where  : {email}
				});

				const tokenData = user.getJSON({fields: ['profile', 'password'], exclude: true});
				token = authService.issue(tokenData);
				userData = user.getJSON({fields: ['password'], exclude: true});
				success = true;
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			console.log(err);
			return res.status(500).json({msg: 'Internal server error'});
		}

		return res.status(200).json({message, success, errors, token, user: userData});
	};

	const login = async (req, res) => {
		let success = false,
			message = '',
			token = null,
			userData = null,
			errors = [];

		const wrongAuthMessage = 'Неправильный email или пароль.';

		try {
			const validation = await validationResult(req);

			if (validation.isEmpty()) {

				const email = req.body.email;
				const password = req.body.password;

				const user = await User.findOne({
					include: [{
						model: UserProfile,
						as   : 'profile'
					}],
					where  : {email}
				});

				if (user && bcryptService.comparePassword(password, user.password)) {
					const tokenData = user.getJSON({fields: ['profile', 'password'], exclude: true});
					token = authService.issue(tokenData);
					userData = user.getJSON({fields: ['password'], exclude: true});
					success = true;
				} else {
					message = wrongAuthMessage;
				}
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			console.log(err);
			return res.status(500).json({msg: 'Internal server error'});
		}

		return res.status(200).json({message, success, errors, token, user: userData});
	};

	const logout = async (req, res) => {
		res.status(200).json({token: '', logout: true});
	};

	const validate = (req, res) => {
		const tokenToVerify = req.cookies.apptoken;

		authService
			.verify(tokenToVerify, (err) => {
				if (err) {
					return res.status(401).json({isvalid: false, err: 'Invalid Token!'});
				}

				return res.status(200).json({isvalid: true});
			});
	};

	const getAll = (req, res) => {
		User
			.findAll()
			.then((users) => res.status(200).json({users}))
			.catch((err) => {
				console.log(err);
				return res.status(500).json({msg: 'Internal server error'});
			});
	};

	const status = async (req, res) => {
		let result = {
				user : null,
				token: null
			},
			user;

		const token = authService.getToken(req);
		const tokenUser = authService.getUser(req);

		let isAuth = false;
		try {
			isAuth = await authService.verify(token);

			const userModel = await User.findOne({
				include: [{
					model: UserProfile,
					as   : 'profile'
				}],
				where  : {id: tokenUser.id}
			});

			user = userModel.getJSON({fields: ['password'], exclude: true});
		}
		catch (e) {
			console.log('Token has expired');
		}

		if (isAuth) {
			result = {
				user,
				token
			};
		}

		return res.status(200).json(result);
	};

	const checkEmail = async (req, res) => {
		let success = false,
			message = '',
			isFree = false,
			errors;

		try {
			const validation = await validationResult(req);

			if (validation.isEmpty()) {
				const email = req.body.email;
				const count = await User.count({where: {email}});
				isFree = count === 0;
				success = true;
			}
			else {
				errors = validation.array();
			}
		}
		catch (e) {
			message = e.toString();
		}

		return res.json({isFree, success, message, errors});
	};

	return {
		register,
		login,
		logout,
		validate,
		getAll,
		status,
		checkEmail,

		getSchema
	};
};

module.exports = UserController;
