/**
 * Description of acl.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 03.04.18 20:44
 */

const AccessControl = require('accesscontrol');

const AppAcl = function (config) {
	const {app, database} = config;
	let grantList = [
		{ role: 'admin', resource: 'plans.list', action: 'read:any' },
		{ role: 'admin', resource: 'plans.count', action: 'read:any' },
		{ role: 'user', resource: 'plans.list', action: 'read:own' },
		{ role: 'guest', resource: 'index', action: 'read:any' },
	];
	const acl = new AccessControl(grantList);
	acl.lock();

	/**
	 * Установим ссылку на acl
	 * @type {AccessControl}
	 */
	app.locals.acl = acl;

	return acl;
};

module.exports = AppAcl;
