/**
 * Description of fieldRules.
 * Different rules for validation fields.
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 25.06.18 10:05
 */

const requiredRule = {
	required: true, message: 'Поле обязательно для заполнения',
};

const stringRule = function (min = 1, max = 255) {
	return {
		type   : 'string',
		min    : min,
		max    : max,
		message: `Длина поля должна быть от ${min} до ${max} символов.`
	}
};

const numberRule = function (min, max) {
	return {
		type   : 'number',
		min    : min,
		max    : max,
		message: `Значение поля должно быть от ${min} до ${max}.`
	}
};

const emailRule = {
	type   : 'email',
	message: 'Введите корректный email адрес'
};

const validateToNextPasswordRule = function (form, name) {
	function validateToNextPassword(rule, value, callback) {
		if (value && form.getFieldValue(name)) {
			form.validateFields([name], {force: true});
		}
		callback();
	}

	return {
		validator: validateToNextPassword
	}
};

const compareFirstPasswordRule = function (form, name) {
	function compareToFirstPassword(rule, value, callback) {
		if (value && value !== form.getFieldValue(name)) {
			callback('Значение поля пароль и подтвердите пароль должны совпадать.');
		} else {
			callback();
		}
	}

	return {
		validator: compareToFirstPassword
	}
};


export default {
	requiredRule,
	stringRule,
	numberRule,
	emailRule,
	validateToNextPasswordRule,
	compareFirstPasswordRule
}
