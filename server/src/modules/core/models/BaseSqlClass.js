/**
 * Description of BaseSqlClass.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 27.06.18 12:47
 */
const Sequelize = require('sequelize');
const sequelize = require('../../../../config/database');
const helpers = require('../../../utils/helpers');
const moment = require('moment');

const tableName = 'base_classes';

const scopes = {
	byName: function (name) {
		return {
			where: {
				name: name
			}
		}
	}
};

const BaseSqlClass = sequelize.define('BaseSqlClass', {
	name       : {
		type: Sequelize.STRING(100),
	},
	description: {
		type     : Sequelize.STRING(100),
		allowNull: true,
	},
	sqlText    : {
		type     : Sequelize.STRING(4000),
		allowNull: true,
		field    : 'sql_text'
	},
	createdAt  : {
		type        : Sequelize.DATE,
		allowNull   : false,
		defaultValue: Sequelize.NOW,
		field       : 'created_at',
		get() {
			return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
		}
	},
	version    : {
		type: Sequelize.INTEGER,
	}
}, {
	tableName,
	scopes
});

module.exports = BaseSqlClass;


