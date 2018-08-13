/**
 * Description of routes.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 03.04.18 20:44
 */

const usersRest = require('./modules/users/config/rest');

const AppRest = function (config) {
	usersRest(config);
};

module.exports = AppRest;
