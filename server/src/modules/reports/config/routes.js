/**
 * Description of routes.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 03.04.18 20:45
 */

const schema = require('../../../services/schema');
const auth = require('../../../services/auth.service');
const multer = require('multer');

const reportCtrl = require('../controllers/ReportController')();

const Routes = function (config) {
	const {app} = config;

	app.get('/categories-amount-report', auth.isJwtAuth, schema(reportCtrl, 'categoriesAmount'), reportCtrl.categoriesAmountReport);
	app.get('/cards-amount-report', auth.isJwtAuth, schema(reportCtrl, 'cardsAmount'), reportCtrl.cardsAmountReport);
};

module.exports = Routes;
