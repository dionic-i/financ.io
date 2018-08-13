/**
 * Description of helpers.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 06.04.18 16:17
 */
const path = require('path');
const _ = require('lodash');
const moment = require('moment');


/**
 *
 * @param fields array
 * @param exclude bool|array
 * @param aliases Object {
 *      field: alias
 * }
 * @returns {{}}
 */
function getJSON({fields = [], exclude = false, aliases = {}} = {}) {
	let me = this,
		json = {};

	if (me.get) {
		const values = Object.assign({}, me.get());

		if (fields.length !== 0) {
			for (let prop in values) {
				if (values.hasOwnProperty(prop)) {
					if ((fields.indexOf(prop) !== -1 && !exclude) || (exclude && fields.indexOf(prop) === -1)) {
						json[prop] = values[prop];
					}
				}
			}
		}
		else {
			json = values;
		}

		// Aliases
		for (let field in aliases) {
			if (aliases.hasOwnProperty(field)) {
				const alias = aliases[field];
				if (json.hasOwnProperty(field)) {
					json[alias] = json[field];
					delete json[field];
				}
			}
		}

		return json;
	}
	else {
		throw new Error('It is not Sequalize model!');
	}
}

/**
 * Remove undefined properties.
 * @param object Object
 * @param withoutNull boolean If true it means that null will not be removed
 * @returns Object
 */
function remUndefined(object, withoutNull = false) {
	let result = {};

	for (let prop in object) {
		if (object.hasOwnProperty(prop)) {
			if ((object[prop] !== undefined && object[prop] !== null ) ||
				(withoutNull && object[prop] === null)) {
				result[prop] = object[prop];
			}
		}
	}

	return result;
}

/**
 * Add optional property to the validation rules.
 * @param params
 * @param fields
 * @returns Object
 */
function addOptionals(params = {}, fields = []) {
	let result = {};

	for (let prop in params) {
		if (params.hasOwnProperty(prop)) {
			if (_.isObject(params[prop])) {
				result[prop] = _.cloneDeep(params[prop]);
				result[prop].optional = fields.length === 0 || fields.indexOf(prop) !== -1;
			}
		}
	}

	return result;
}

/**
 *
 * @param value
 * @param format
 */
function parseDate(value, format = 'YYYY-MM-DD HH:mm:ss') {
	let mDate;

	// Check standart moment
	mDate = moment(value);
	if (mDate.isValid()) {
		return mDate.format(format);
	}

	// Check custom format
	mDate = moment(value, 'YYYYMMDDTHH:mm:ssZZ');
	if (mDate.isValid()) {
		return mDate.format(format);
	}

	// Custom RSB format
	const tpl = /^(\d{4})(\d{2})(\d{2})T(\d{2}:\d{2}:\d{2})/i;
	const match = value.match(tpl);
	if (match && match.length === 5) {
		const [, year, month, day, time] = match;
		mDate = moment(`${year}-${month}-${day} ${time}`);
		if (mDate.isValid()) {
			return mDate.format(format);
		}
	}

	return value;
}


module.exports = {
	getJSON,
	remUndefined,
	addOptionals,
	parseDate
};
