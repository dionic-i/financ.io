const authService = require('../../../services/auth.service');
const Card = require('../../cards/models/Card');


const DefaultController = () => {

	const settings = async (req, res) => {
		const settings = {
			appName: 'financ.io',
			version: '1.0'
		};
		return res.json({settings});
	};

	const menu = async (req, res) => {

		const menu = [{
			key        : 'index',
			title      : 'Главная страница',
			icon       : '',
			route      : '/',
			right      : false,
			permissions: 'USER',
			position   : 0
		}, {
			key        : 'categories',
			title      : 'Категории',
			icon       : '',
			route      : '/categories',
			right      : false,
			permissions: 'USER',
			position   : 2
		},{
			key        : 'reports',
			title      : 'Отчеты',
			icon       : '',
			route      : '/reports',
			right      : false,
			permissions: 'USER',
			position   : 3
		}, {
			key        : 'logout',
			title      : 'Выход',
			icon       : '',
			route      : '',
			isLogoutBtn: true,
			right      : true,
			permissions: 'USER',
			position   : 4
		}, {
			key        : 'profile',
			title      : 'Профиль',
			icon       : '',
			route      : '/profile',
			right      : true,
			permissions: 'USER',
			position   : 5
		}, {
			key        : 'login',
			title      : 'Вход',
			icon       : '',
			route      : '/login',
			right      : false,
			permissions: 'GUEST',
			position   : 6
		}, {
			key        : 'signup',
			title      : 'Регистрация',
			icon       : '',
			route      : '/signup',
			right      : false,
			permissions: 'GUEST',
			position   : 7
		}];

		let items, isAuth = false;
		const user = authService.getUser(req);
		const token = authService.getToken(req);

		try {
			isAuth = await authService.verify(token);
		}
		catch (e) {
			console.log('Token has expired');
		}

		if (!user || !isAuth) {
			console.log('Not auth');
			items = menu.filter(item => {
				return item.permissions === 'GUEST' || item.permissions === '';
			});
		} else {
			// Пользователь авторизирован
			items = menu.filter(item => {
				return user.role.toUpperCase() === item.permissions || item.permissions === '';
			});

			// Add cards menu.
			const records = await Card.getUserCards(user.id);
			if (records.length > 0) {

				let cardsMenu = {
					key        : 'cards',
					title      : 'Карты',
					icon       : '',
					route      : '',
					right      : false,
					permissions: 'USER',
					position   : 1
				};

				cardsMenu.submenu = records.map(item => {
					return {
						key        : 'card:' + item.id,
						title      : item.name,
						icon       : '',
						route      : '/card/' + item.id,
						permissions: 'USER'
					}
				});

				items.push(cardsMenu);
			}

			items.sort((a, b) => {return a.position < b.position ? -1 : 1});
		}

		return res.status(200).json({
			menu: items
		});
	};

	return {
		menu,
		settings
	};
};

module.exports = DefaultController;
