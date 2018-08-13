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

const catCtrl = require('../controllers/CategoryController')();
const ptCtrl = require('../controllers/PatternController')();

const Routes = function (config) {

	const {app} = config;

	// Categories
	app.get('/category', auth.isJwtAuth, catCtrl.list);
	app.put('/category', auth.isJwtAuth, schema(catCtrl, 'add'), catCtrl.add);
	app.post('/category/:id', auth.isJwtAuth, schema(catCtrl, 'update'), catCtrl.update);
	app.delete('/category/:id', auth.isJwtAuth, schema(catCtrl, 'remove'), catCtrl.remove);
	app.post('/category/:id', auth.isJwtAuth, schema(catCtrl, 'remove'), catCtrl.remove);

	// Patterns
	app.get('/category/:id/pattern', schema(ptCtrl, 'list'), auth.isJwtAuth, ptCtrl.list);
	app.put('/pattern', auth.isJwtAuth, schema(ptCtrl, 'add'), ptCtrl.add);
	app.post('/pattern/:id', auth.isJwtAuth, schema(ptCtrl, 'update'), ptCtrl.update);
	app.delete('/pattern/:id', auth.isJwtAuth, schema(ptCtrl, 'remove'), ptCtrl.remove);
	app.post('/category/check/remove/:id', auth.isJwtAuth, schema(catCtrl, 'check'), catCtrl.categoryCheckRemove);
};

module.exports = Routes;
