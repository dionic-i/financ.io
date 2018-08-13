const Sequelize = require('sequelize');
const sequelize = require('../../../../config/database');

const tableName = 'card_types';

const CardType = sequelize.define('CardType', {
	id  : {
		type         : Sequelize.SMALLINT,
		primaryKey   : true,
		autoIncrement: false
	},
	name: {
		type     : Sequelize.STRING(50),
		allowNull: false
	},
	icon: {
		type: Sequelize.STRING(50)
	}
}, {
	tableName
});

module.exports = CardType;
