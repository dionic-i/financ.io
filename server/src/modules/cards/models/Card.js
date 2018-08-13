const Sequelize = require('sequelize');
const sequelize = require('../../../../config/database');
const User = require('../../users/models/User');
const Transaction = require('./Transaction');
const CardType = require('./CardType');
const CardFile = require('./CardFile');
const helpers = require('../../../utils/helpers');

const tableName = 'cards';
const ACTIVE = 1;
const INACTIVE = 0;

const scopes = {
	isActive: {
		where: {
			status: ACTIVE
		}
	},
	isInActive: {
		where: {
			status: INACTIVE
		}
	},
	toUser: function(id) {
		return {
			where: {
				user_id: id
			}
		}
	}
};

const hooks = {
	beforeSave: (card, options) => {
		if (!card.status) {
			card.status = ACTIVE;
		}
	},
};

const Card = sequelize.define('Card', {
	name     : {
		type        : Sequelize.STRING(20),
		allowNull   : false,
		defaultValue: 'New card',
	},
	desc     : {
		type        : Sequelize.STRING(100),
		defaultValue: 'It is my new card',
	},
	total     : {
		type        : Sequelize.DECIMAL(15, 2),
		defaultValue: 0,
		get() {
			return parseFloat(this.getDataValue('total')) || 0;
		},
	},
	createdAt: {
		type        : Sequelize.DATE,
		allowNull   : false,
		defaultValue: Sequelize.NOW,
		field       : 'created_at'
	},
	status   : {
		type        : Sequelize.SMALLINT,
		allowNull   : false,
		defaultValue: ACTIVE,
	},
	type     : {
		type      : Sequelize.SMALLINT,
		allowNull : false,
		references: {
			model: CardType,
			key  : 'id',
		},
		field     : 'card_type_id'
	},
	user     : {
		type      : Sequelize.INTEGER,
		allowNull : false,
		references: {
			model: User,
			key  : 'id',
		},
		field     : 'user_id'
	}
}, {
	tableName,
	scopes,
	hooks,
	constants: {
		'ACTIVE'  : ACTIVE,
		'INACTIVE': INACTIVE
	}
});

/**
 * Relations
 */
Card.belongsTo(CardType, {as: 'cardType', foreignKey: 'card_type_id'});

Card.hasMany(Transaction, {as: 'opers'});
Transaction.belongsTo(Card, {as: 'card', foreignKey: 'card_id'});

Card.hasMany(CardFile, {as: 'files', foreignKey: 'card_id'});
CardFile.belongsTo(Card, {as: 'card', foreignKey: 'card_id'});

/**
 * Class methods
 */
Card.getUserCardById = async function (id, userId) {
	return await Card.scope('isActive', {method: ['toUser', userId]}).findById(id);
};

Card.getUserCards = async function (userId) {
	return await Card.scope('isActive', {method: ['toUser', userId]}).findAll();
};

/**
 * Instance methods
 */
Card.prototype.getJSON = helpers.getJSON;

module.exports = Card;
