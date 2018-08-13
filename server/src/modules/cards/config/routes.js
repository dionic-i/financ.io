/**
 * Description of routes.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 03.04.18 20:45
 */

const schema = require('../../../services/schema');
const upload = require('../../../services/upload');
const auth = require('../../../services/auth.service');
const multer = require('multer');

const cardCtrl = require('../controllers/CardController')();
const cfCtrl = require('../controllers/CardFilesController')();
const trCtrl = require('../controllers/TransactionController')();

const Routes = function (config) {

	const {app} = config;

	// Cards
	app.get('/card', auth.isJwtAuth, cardCtrl.list);
	app.get('/card/:id', auth.isJwtAuth, schema(cardCtrl, 'item'), cardCtrl.item);
	app.put('/card', auth.isJwtAuth, schema(cardCtrl, 'add'), cardCtrl.add);
	app.post('/card/:id', auth.isJwtAuth, schema(cardCtrl, 'update'), cardCtrl.update);
	app.delete('/card/:id', auth.isJwtAuth, schema(cardCtrl, 'remove'), cardCtrl.remove);
	app.get('/card/operations/:id', auth.isJwtAuth, schema(cardCtrl, 'check'), cardCtrl.cardsOperationsCount);

	// CardFiles
	app.post('/card/:id/upload', auth.isJwtAuth, schema(cfCtrl, 'upload'), upload(cfCtrl, 'operations', config), cfCtrl.uploadFile);
	app.get('/card/:id/files/:file_id', auth.isJwtAuth, schema(cfCtrl, 'operations'), cfCtrl.operations);
	app.get('/card/:id/files', auth.isJwtAuth, schema(cfCtrl, 'list'), cfCtrl.list);
	app.delete('/card/:id/files', auth.isJwtAuth, schema(cfCtrl, 'remove'), cfCtrl.remove);

	// Transactions
	app.get('/transaction', auth.isJwtAuth, trCtrl.list);
	app.put('/transaction', auth.isJwtAuth, schema(trCtrl, 'add'), trCtrl.add);
	app.put('/transaction/upload', auth.isJwtAuth, schema(trCtrl, 'upload'), trCtrl.upload);
	app.post('/transaction/:id', auth.isJwtAuth, schema(trCtrl, 'update'), trCtrl.update);
	app.delete('/transaction/:id', auth.isJwtAuth, schema(trCtrl, 'remove'), trCtrl.remove);
	app.delete('/transactions/delete', auth.isJwtAuth, schema(trCtrl, 'removeRange'), trCtrl.removeRange);
	app.post('/transactions/sync', auth.isJwtAuth, schema(trCtrl, 'sync'), trCtrl.sync);
};

module.exports = Routes;
