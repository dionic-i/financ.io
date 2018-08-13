const Sequelize = require('sequelize');
const sequelize = require('../../../../config/database');

const User = require('../../users/models/User');
const Transaction = require('./Transaction');
const CardType = require('./CardType');
const helpers = require('../../../utils/helpers');
const moment = require('moment');

const tableName = 'card_files';

const IS_SAVED = 1;
const NOT_SAVED = 0;

const scopes = {
	byCard: function (id) {
		return {
			where: {
				card_id: id
			}
		}
	}
};

const CardFile = sequelize.define('CardFile', {
	filename       : {
		type     : Sequelize.STRING(100),
		allowNull: false
	},
	originalName   : {
		type     : Sequelize.STRING(100),
		allowNull: false,
		field    : 'original_name'
	},
	mimeType       : {
		type     : Sequelize.STRING(50),
		allowNull: false,
		field    : 'mime_type'
	},
	destination    : {
		type     : Sequelize.STRING(300),
		allowNull: false,
	},
	size           : {
		type     : Sequelize.INTEGER,
		allowNull: false,
		get() {
			return parseInt(this.getDataValue('size')) || 0;
		}
	},
	isSaved        : {
		type        : Sequelize.SMALLINT,
		allowNull   : false,
		field       : 'is_saved',
		defaultValue: NOT_SAVED,
		get() {
			return this.getDataValue('isSaved') === IS_SAVED;
		}
	},
	operationsCount: {
		type        : Sequelize.SMALLINT,
		allowNull   : false,
		field       : 'operations_count',
		defaultValue: 0
	},
	createdAt      : {
		type        : Sequelize.DATE,
		allowNull   : false,
		defaultValue: Sequelize.NOW,
		field       : 'created_at',
		get() {
			return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD');
		}
	}
	// card        : {
	// 	type      : Sequelize.INTEGER,
	// 	references: {
	// 		model: Card,
	// 		key  : 'id',
	// 	},
	// 	field     : 'card_id'
	// }
}, {
	tableName,
	scopes,
	constants: {
		'IS_SAVED': IS_SAVED,
		'NOT_SAVE': NOT_SAVED
	}
});

CardFile.prototype.getJSON = helpers.getJSON;

module.exports = CardFile;
