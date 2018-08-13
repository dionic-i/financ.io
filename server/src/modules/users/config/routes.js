/**
 * Description of routes.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 03.04.18 20:45
 */

const userCtrl = require('../controllers/UserController')();
const profileCtrl = require('../controllers/ProfileController')();

const auth = require('../../../services/auth.service');
const schema = require('../../../services/schema');
const upload = require('../../../services/upload');

const Routes = function (config) {

	const {app} = config;

	/**
	 * User routes
	 */
	app.post('/register', schema(userCtrl, 'register'), userCtrl.register);
	app.post('/login', schema(userCtrl, 'login'), userCtrl.login);
	app.post('/logout', auth.isJwtAuth, userCtrl.logout);
	app.get('/status', userCtrl.status);
	app.get('/validate', userCtrl.validate);
	app.post('/check/email', schema(userCtrl, 'checkEmail'), userCtrl.checkEmail);

	/**
	 * Profile routes
	 */
	app.get('/profile/:id', auth.isJwtAuth, schema(profileCtrl, 'load'), profileCtrl.load);
	app.post('/profile/:id', auth.isJwtAuth, schema(profileCtrl, 'update'), profileCtrl.save);
	app.post('/settings/:id', auth.isJwtAuth, schema(profileCtrl, 'settings'), profileCtrl.saveSettings);
	app.post('/upload/avatar', auth.isJwtAuth, upload(profileCtrl, 'upload', config), profileCtrl.uploadAvatar);
	app.post('/remove/avatar', auth.isJwtAuth, profileCtrl.removeAvatar);

};

module.exports = Routes;
