/**
 * Description of userService.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 22.03.18 11:13
 */
import config from '../../../utils/config';
import request from '../../../utils/request';

const {apiPrefix} = config;
const {userLoginUrl, userLogoutUrl, statusUrl, userSignUpUrl} = config[apiPrefix];

function signIn(params) {
	return request({
		url   : userLoginUrl,
		method: 'post',
		data  : params
	});
}

function signUp(params) {
	return request({
		url   : userSignUpUrl,
		method: 'post',
		data  : params
	});
}

function doLogout() {
	return request({
		url   : userLogoutUrl,
		method: 'post'
	});
}

function checkStatus() {
	return request({
		url   : statusUrl,
		method: 'get'
	});
}


export {
	signIn,
	signUp,
	doLogout,
	checkStatus
}
