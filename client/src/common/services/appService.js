/**
 * Description of appService.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 22.03.18 12:19
 */
import config from '../../utils/config';
import request from '../../utils/request';

const {apiPrefix} = config;
const {menuUrl} = config[apiPrefix];

function fetchMenuItems() {
	return request({
		url   : menuUrl,
		method: 'get'
	});
}

export {
	fetchMenuItems
}
