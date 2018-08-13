const Sequelize = require('sequelize');
const sequelize = require('../../../../config/database');

const UserCategory = require('../../cards/models/UserCategory');
const Pattern = require('./Pattern');
const Transaction = require('../../cards/models/Transaction');
const helpers = require('../../../utils/helpers');

const tableName = 'categories';

const Category = sequelize.define('Category', {
	name     : {
		type        : Sequelize.STRING(100),
		allowNull   : false,
		defaultValue: 'New category',
	},
	createdAt: {
		type        : Sequelize.DATE,
		allowNull   : false,
		defaultValue: Sequelize.NOW,
		field       : 'created_at'
	}
}, {
	tableName
});

/**
 * Relations
 */
Category.hasOne(UserCategory, {as: 'userCategory', foreignKey: 'category_id'});
Category.hasMany(Pattern, {as: 'patterns', foreignKey: 'category_id'});
Pattern.belongsTo(Category, {foreignKey: 'category_id'});

/**
 * Instance methods
 */
Category.prototype.getJSON = helpers.getJSON;

module.exports = Category;
