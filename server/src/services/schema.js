/**
 * Description of schema checker middleware.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 17.05.18 9:28
 */

const {checkSchema} = require('express-validator/check');

function schema(controller, scenario) {
	const rules = controller.getSchema();
	const schema = rules[scenario] || {};
	return checkSchema(schema);
}

module.exports = schema;
