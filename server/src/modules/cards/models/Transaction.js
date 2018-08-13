const Sequelize = require('sequelize');
const sequelize = require('../../../../config/database');
const helpers = require('../../../utils/helpers');
const moment = require('moment');

const Category = require('../../categories/models/Category');
const Card = require('./Card');
const Op = Sequelize.Op;

const tableName = 'transactions';

const INCOME = 1;
const OUTCOME = 0;

const scopes = {
	byCard  : function (id) {
		return {
			where: {
				card_id: id
			}
		}
	},
	byPeriod: function (start, end) {
		return {
			where: {
				iddate: {
					[Op.between]: [start, end]
				}
			}
		}
	},
	withoutCategory: function () {
		return {
			where: {
				category_id: null
			}
		}
	},
};

const Transaction = sequelize.define('Transaction', {
	short    : {
		type     : Sequelize.STRING(100),
		allowNull: true,
	},
	full     : {
		type     : Sequelize.STRING(254),
		allowNull: true
	},
	createdAt: {
		type        : Sequelize.DATE,
		allowNull   : false,
		defaultValue: Sequelize.NOW,
		field       : 'created_at',
		get() {
			return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
		}
	},
	iddate   : {
		type     : Sequelize.DATE,
		allowNull: false,
		get() {
			return moment(this.getDataValue('iddate')).format('YYYY-MM-DD');
		}
	},
	type     : {
		type        : Sequelize.INTEGER,
		allowNull   : false,
		defaultValue: OUTCOME,
	},
	amount   : {
		type        : Sequelize.NUMERIC,
		allowNull   : false,
		defaultValue: 0.0,
		get() {
			return parseFloat(this.getDataValue('amount'))
		}
	},
	// card     : {
	// 	type      : Sequelize.INTEGER,
	// 	allowNull : false,
	// 	references: {
	// 		model: Card,
	// 		key  : 'id',
	// 	},
	// 	field     : 'card_id'
	// },
	// category : {
	// 	type      : Sequelize.INTEGER,
	// 	references: {
	// 		model: Category,
	// 		key  : 'id',
	// 	},
	// 	field     : 'category_id'
	// }
}, {
	tableName,
	constants: {
		'INCOME' : INCOME,
		'OUTCOME': OUTCOME
	},
	scopes
});

Category.hasMany(Transaction, {as: 'opers', foreignKey: 'category_id', optional: true});
Transaction.belongsTo(Category, {foreignKey: 'category_id'});

/**
 * Instance methods
 */

Transaction.prototype.getJSON = helpers.getJSON;

Transaction.prototype.isIncome = function () {
	return this.type === INCOME
};

Transaction.prototype.getAmountByType = function () {
	return this.type === INCOME ? this.amount : (-1) * this.amount;
};

/**
 * Class methods
 */
Transaction.getCountByCard = async function (card_id) {
	return await Transaction.count({where: {card_id: card_id}});
};

module.exports = Transaction;
