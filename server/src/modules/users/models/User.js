const sequelize = require('../../../../config/database');
const Sequelize = require('sequelize');
const bcryptService = require('../../../services/bcrypt.service');
const Card = require('../../../modules/cards/models/Card');
const Category = require('../../../modules/categories/models/Category');
const UserCategory = require('../../../modules/cards/models/UserCategory');
const UserProfile = require('./UserProfile');
const helpers = require('../../../utils/helpers');
const moment = require('moment');


const hooks = {
	beforeCreate(user) {
		user.password = bcryptService.password(user);
	},
};

const ACTIVE = 1;
const INACTIVE = 0;

const tableName = 'users';

const User = sequelize.define('User', {
	email     : {
		type  : Sequelize.STRING(100),
		unique: true,
	},
	password  : {
		type     : Sequelize.STRING,
		allowNull: false
	},
	role      : {
		type        : Sequelize.STRING(50),
		allowNull   : false,
		defaultValue: 'user'
	},
	status    : {
		type        : Sequelize.SMALLINT,
		allowNull   : false,
		defaultValue: ACTIVE
	},
	createdAt : {
		type        : Sequelize.DATE,
		allowNull   : false,
		defaultValue: Sequelize.NOW,
		field       : 'created_at',
		get() {
			return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
		}
	}
}, {
	tableName,
	hooks,
	constants: {
		'ACTIVE'  : ACTIVE,
		'INACTIVE': INACTIVE
	}
});

/**
 * Instance methods
 */

User.prototype.toJSON = function () {
	const values = Object.assign({}, this.get());
	delete values.password;
	return values;
};

User.prototype.getJSON = helpers.getJSON;

User.prototype.comparePassword = function (candidatePassword, cb) {
	const isMatch = bcryptService.comparePassword(candidatePassword, this.password);
	cb(null, isMatch);
};

/**
 * Associations
 */

User.hasMany(Card, {as: 'cards'});
Card.belongsTo(User, {as: 'owner', foreignKey: 'user_id'});
User.belongsTo(UserProfile, {as: 'profile'});
User.belongsToMany(Category, {as: 'categories', through: UserCategory});

module.exports = User;
