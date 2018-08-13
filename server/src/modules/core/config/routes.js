/**
 * Description of routes.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 03.04.18 20:45
 */

const aclChecker = require('../../../services/acl');
const schema = require('../../../services/schema');
const auth = require('../../../services/auth.service');
const multer = require('multer');
const defCtrl = require('../controllers/DefaultController')();
const dashCtrl = require('../controllers/DashboardController')();

const Routes = function (config) {
	const {app} = config;
	app.get('/menu', defCtrl.menu);
	app.get('/settings', auth.isJwtAuth, aclChecker(config), defCtrl.settings);
	app.get('/amounts-by-category', schema(dashCtrl, 'amount'), dashCtrl.amountsByCategory);
};

module.exports = Routes;
