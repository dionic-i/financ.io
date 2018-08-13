/**
 * Description of dataLoader.
 * This is a service for loading data from DB by executing hard queries.
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 27.06.18 12:54
 */
const BaseSqlClasses = require('../models/BaseSqlClass');
const sequelize = require('../../../../config/database');

function DataLoader() {
	let me = this;
	me.dataclasses = new Map();
	me.init();
}

DataLoader.prototype.init = function () {
	let me = this;
	BaseSqlClasses.findAll().then((classes) => {
		for (let i = 0; i < classes.length; i++) {
			const item = classes[i];
			const {name, sqlText, version} = item;
			if (!me.dataclasses.has(name)) {
				me.dataclasses.set(name, {
					name,
					sqlText,
					version
				});
			}
		}
	});
};

DataLoader.prototype.getDataclass = async function (name) {
	let me = this,
		dc = false;

	if (!me.dataclasses.has(name)) {
		dc = await BaseSqlClasses.scope({method: ['byName', name]}).findOne();
		if (dc) {
			const {name, sqlText, version} = dc;
			me.dataclasses.set(name, {
				name,
				sqlText,
				version
			});
		}
	} else {
		dc = me.dataclasses.get(name);
	}

	return dc;
};

DataLoader.prototype.query = async function (name, params = false) {
	let me = this,
		dc;

	dc = await me.getDataclass(name);

	if (dc) {
		const options = params
			? {replacements: params, type: sequelize.QueryTypes.SELECT}
			: {type: sequelize.QueryTypes.SELECT};

		return await sequelize.query(dc.sqlText, options);
	}
	else {
		throw new Error(`Can not find dataclass ${name}`);
	}
};

module.exports = new DataLoader();
