const Sequelize = require('sequelize');
const sequelize = require('../../../../config/database');

const helpers = require('../../../utils/helpers');
const Category = require('./Category');

const tableName = 'patterns';

const Pattern = sequelize.define('Pattern', {
	name    : {
		type     : Sequelize.STRING(100),
		allowNull: false
	},
	search  : {
		type     : Sequelize.STRING(100),
		allowNull: false
	},
	category: {
		type      : Sequelize.INTEGER,
		allowNull : false,
		references: {
			model: Category,
			key  : 'id',
		},
		field     : 'category_id'
	}
}, {
	tableName
});

Pattern.prototype.getJSON = helpers.getJSON;

module.exports = Pattern;
