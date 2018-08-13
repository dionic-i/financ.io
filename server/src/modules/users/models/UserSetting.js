/**
 * Description of SettingModel.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.07.18 8:48
 */
const sequelize = require('../../../../config/database');
const Sequelize = require('sequelize');
const helpers = require('../../../utils/helpers');

const tableName = 'user_settings';

const UserSetting = sequelize.define('UserSetting', {
	page  : {
		type     : Sequelize.STRING(100),
		allowNull: false
	},
	settings : {
		type: Sequelize.JSON
	}
}, {
	tableName
});

/**
 * Instance methods
 */

UserSetting.prototype.getJSON = helpers.getJSON;

/**
 * Associations
 */

module.exports = UserSetting;
