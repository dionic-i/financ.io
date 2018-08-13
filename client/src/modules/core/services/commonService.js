/**
 * Description of commonService.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 27.03.18 13:40
 */
import config from '../../../utils/config';
import request from '../../../utils/request';

const {apiPrefix} = config;
const {usersUrl} = config[apiPrefix];

function fetchUsers() {
	return request({
		url   : usersUrl,
		method: 'get'
	});
}

function fetchData(url, params) {
	return request({
		url   : url,
		method: 'GET',
		params: params
	});
}

function saveData(url, method, data) {
	return request({
		url   : url,
		method: method,
		data  : data
	});
}

export {
	fetchUsers,
	fetchData,
	saveData
}
