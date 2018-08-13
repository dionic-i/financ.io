/**
 * Description of userActivityLog.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 04.07.18 13:54
 */

const authService = require('./auth.service');
const UserProfile = require('../modules/users/models/UserProfile');
const moment = require('moment');


function userActivityLogger(options) {
	return (req, res, next) => {
		const user = authService.getUser(req);
		if (user) {
			UserProfile.update({lastActive: moment().format('YYYY-MM-DD HH:mm:ss')}, {
				where: {id: user.profile_id}
			})
		}
		next();
	}
}

module.exports = userActivityLogger;
