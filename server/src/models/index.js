/**
 * Description of index.
 * Данный файл содержит все модели приложения для синхронизации структуры БД.
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 26.04.18 7:44
 */

const User = require('../modules/users/models/User');
const UserProfile = require('../modules/users/models/UserProfile');
const UserSetting = require('../modules/users/models/UserSetting');
const CardType = require('../modules/cards/models/CardType');
const Card = require('../modules/cards/models/Card');
const Category = require('../modules/categories/models/Category');
const Pattern = require('../modules/categories/models/Pattern');
const Transaction = require('../modules/cards/models/Transaction');
const UserCategory = require('../modules/cards/models/UserCategory');
const BaseSqlClass = require('../modules/core/models/BaseSqlClass');

module.exports = {
	User,
	UserProfile,
	UserSetting,
	CardType,
	Card,
	Category,
	Pattern,
	Transaction,
	UserCategory,
	BaseSqlClass
};
