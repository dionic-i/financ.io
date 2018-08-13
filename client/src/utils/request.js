/**
 * Description of request.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 22.03.18 12:19
 */
import axios from 'axios';
import lodash from 'lodash';
import {getUserData} from './helpers';

export default function request(options) {
	const token = getUserData('authorized');

	let sendOptions = options || {};

	if (token) {
		sendOptions = lodash.extend(options, {
			headers: {
				'authorized': token
			},
			params : lodash.extend(sendOptions.params || {})
		});
	}

	return axios.request(sendOptions).then((response) => {
		const {statusText, status} = response;
		let data = response.data;

		return Promise.resolve({
			success   : true,
			message   : statusText,
			statusCode: status,
			...data,
		});

	}).catch((error) => {
		const {response} = error;
		let msg;
		let statusCode;
		if (response && response instanceof Object) {
			const {data, statusText} = response;
			statusCode = response.status;
			msg = data.message || statusText
		} else {
			statusCode = 600;
			msg = error.message || 'Network Error';
		}
		return Promise.reject({success: false, statusCode, message: msg})
	})
}
