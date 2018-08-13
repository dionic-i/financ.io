/**
 * Description of routes.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 03.04.18 20:44
 */

const coreRoutes = require('./modules/core/config/routes');
const usersRoutes = require('./modules/users/config/routes');
const reportsRoutes = require('./modules/reports/config/routes');
const categoriesRoutes = require('./modules/categories/config/routes');
const cardsRoutes = require('./modules/cards/config/routes');

const appCtrl = require('./controllers/AppContrroller')();

const AppRoutes = function (config) {

	const {app} = config;

	app.get('/', appCtrl.index);

	coreRoutes(config);
	usersRoutes(config);
	reportsRoutes(config);
	categoriesRoutes(config);
	cardsRoutes(config);

	/**
	 * 500
	 */
	app.use(function (err, req, res, next) {
		console.error(err.stack);
		if (req.xhr) {
			res.status(500).json({
				success: false,
				message: 'Internal server error'
			});
		} else {
			res.status(500).render('500');
		}
	});

};

module.exports = AppRoutes;
