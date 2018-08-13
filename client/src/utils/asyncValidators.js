/**
 * Description of fieldRules.
 * Different rules for validation fields.
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 25.06.18 10:05
 */
import request from './request';


const checkEmailValidator = function (url) {

	function checkEmail(rule, value, callback) {
		request({
			url   : url,
			method: 'POST',
			data  : {email: value}
		}).then((result) => {
			const {success, isFree, message} = result;
			if (success && isFree) {
				callback();
			}
			else {
				const msg = message ? message : 'Данный email адрес занят.';
				callback(msg);
			}
		});
	}

	return {
		validator: checkEmail
	}
};


export default {
	checkEmailValidator
}
