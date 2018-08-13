/**
 * Description of helpers.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 22.03.18 13:51
 */
import Cookies from 'js-cookie';

function delay(ms, cb) {
	return new Promise(resolve => {
		setTimeout(() => {
			cb();
			resolve();
		}, ms);
	})
}

function delayAnswer(ms, value) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(value);
		}, ms);
	})
}

function setUserData(name, value) {
	if (window.localStorage) {
		window.localStorage.setItem(name, value)
	}
	else {
		Cookies.set(name, value, {expires: 7});
	}
}

function getUserData(name) {
	let token;
	if (window.localStorage) {
		token = window.localStorage.getItem(name)
	}
	else {
		token = Cookies.get(name);
	}

	return token;
}

function removeUserData(name) {
	if (window.localStorage) {
		window.localStorage.removeItem(name)
	}
	else {
		Cookies.remove(name);
	}
}

function removeEmpty(object) {
	let result = {};
	for (let prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (object[prop]) {
				result[prop] = object[prop];
			}
		}
	}
	return result;
}

export {
	delay,
	delayAnswer,
	setUserData,
	getUserData,
	removeUserData,
	removeEmpty
}
