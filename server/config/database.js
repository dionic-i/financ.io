const Sequelize = require('sequelize');

let database;

database = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASS, {
		host    : process.env.DB_HOST,
		dialect : 'postgres',
		timezone: '+03:00',
		pool    : {
			max : 5,
			min : 0,
			idle: 10000,
		},
		define  : {
			timestamps : false,
			underscored: true,
			charset    : 'utf8',
		}
	});

/**
 * Add class constants to model.
 */
database.hook('afterDefine', Model => {
	if (Model.options.constants) {
		for (let name in Model.options.constants) {
			Object.defineProperty(Model, name, {
				value     : Model.options.constants[name],
				enumerable: true
			});
		}
	}
});

module.exports = database;
