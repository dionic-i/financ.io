const Sequelize = require('sequelize');
const sequelize = require('../../../../config/database');
const User = require('../../users/models/User');
const Category = require('../../categories/models/Category');

const tableName = 'users_categories';

const scopes = {
	toUser: function(id) {
		return {
			where: {
				user_id: id
			}
		}
	}
};

const UserCategory = sequelize.define('UserCategory', {
	user    : {
		type      : Sequelize.INTEGER,
		allowNull : false,
		references: {
			model: User,
			key  : 'id',
		},
		field     : 'user_id'
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
	tableName,
	scopes
});

module.exports = UserCategory;
