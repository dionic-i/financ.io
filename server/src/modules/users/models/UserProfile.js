/**
 * Description of UserProfile.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 04.07.18 11:11
 */
const sequelize = require('../../../../config/database');
const Sequelize = require('sequelize');
const helpers = require('../../../utils/helpers');
const moment = require('moment');

const tableName = 'users_profile';


const UserProfile = sequelize.define('UserProfile', {
	username  : {
		type     : Sequelize.STRING(50),
		allowNull: false
	},
	firstname : {
		type: Sequelize.STRING(50)
	},
	secondname: {
		type: Sequelize.STRING(50)
	},
	birthday  : {
		type: Sequelize.DATE,
		get() {
			const value = this.getDataValue('birthday');
			return value ? moment(this.getDataValue('birthday')).format('YYYY-MM-DD') : null;
		}
	},
	lastActive: {
		type        : Sequelize.DATE,
		allowNull   : false,
		defaultValue: Sequelize.NOW,
		field       : 'last_active',
		get() {
			return moment(this.getDataValue('lastActive')).format('YYYY-MM-DD HH:mm:ss');
		}
	},
	settings  : {
		type: Sequelize.JSON
	},
	avatar    : {
		type: Sequelize.STRING(100),
		get() {
			const value = this.getDataValue('avatar');
			const avatar = value ? value : 'default-avatar.jpg';
			return this.getAvatarUrl() + avatar;
		}
	}
}, {
	tableName
});

/**
 * Instance methods
 */

UserProfile.prototype.getJSON = helpers.getJSON;

UserProfile.prototype.getAvatarUrl = function () {
	return process.env.BASE_URL + process.env.USER_AVATARS_PATH;
};

/**
 * Associations
 */

module.exports = UserProfile;

