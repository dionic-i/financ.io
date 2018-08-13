/**
 * Description of users.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 06.04.18 17:16
 */

const User = require('../models/User');

module.exports = function (config) {

	const {app, epilogue} = config;

	// Create REST resource
	epilogue.resource({
		model    : User,
		endpoints: ['/men', '/men/:id']
	});

};
