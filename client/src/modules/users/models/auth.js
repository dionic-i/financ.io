/**
 * Description of auth.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.04.18 12:24
 */
import {types, flow, applySnapshot, getParent, getRoot} from "mobx-state-tree"
import {signIn, signUp, doLogout, checkStatus} from "../services/userService";
import {getUserData, setUserData, removeUserData} from '../../../utils/helpers';

export const initialAuth = {
	username    : '',
	email       : '',
	password    : '',
	isAuth      : false,
	token       : '',
	inProgress  : false,
	loginSuccess: false
};

export const AuthModel = types
	.model({
		username    : '',
		email       : '',
		password    : '',
		isAuth      : false,
		token       : '',
		errors      : types.optional(types.array(types.string), []),
		inProgress  : false,
		loginSuccess: false
	})
	.actions(self => {

		const root = getRoot(self);

		const setCredentials = function (values) {
			applySnapshot(self, values);
		};

		const reset = function () {
			applySnapshot(self, {
				email   : '',
				password: ''
			});
		};

		const saveToken = function (token) {
			self.token = token;
			setUserData('authorized', token);
		};

		const getToken = function () {
			return getUserData('authorized')
		};

		const removeToken = function () {
			self.token = '';
			removeUserData('authorized');
		};

		const login = flow(function* login() {
			try {
				self.inProgress = true;

				const params = {
					email   : self.email,
					password: self.password
				};

				const {success, token, message, errors, user} = yield signIn(params);

				if (success) {
					reset();
					self.isAuth = true;
					saveToken(token);
					const menu = root.menu;
					yield menu.load().then(() => {
						menu.changeLocation('index');
					});
					root.user.setUser(user);
				}
				else {
					root.showErrorMessages(message, errors);
				}

				self.loginSuccess = true;
				self.inProgress = false;
			} catch (err) {
				self.inProgress = false;
				self.loginSuccess = false;
				console.error("Failed to login ", err)
			}
		});

		const register = flow(function* register(values) {

			try {
				self.inProgress = true;
				const {success, token, message, errors} = yield signUp(values);

				if (success) {
					reset();
					self.isAuth = true;
					saveToken(token);
					const menu = root.menu;
					yield menu.load().then(() => {
						menu.changeLocation('index');
					});
				}
				else {
					root.showErrorMessages(message, errors);
				}

				self.loginSuccess = true;
				self.inProgress = false;
			} catch (err) {
				self.inProgress = false;
				self.loginSuccess = false;
				console.error("Failed to login ", err)
			}
		});

		const logout = flow(function* logout() {
			try {
				const root = getParent(self);
				const {success} = yield doLogout();

				if (success) {
					self.isAuth = false;
					removeToken();
					root.user.forgetUser();
					yield root.menu.load().then(() => {
						root.menu.changeLocation('login');
					});
					root.setInitialState();
				}
			} catch (err) {
				console.error("Failed to logout", err);
			}
		});

		const status = flow(function* status() {
			try {
				const root = getParent(self);
				const {success, user, token} = yield checkStatus();

				if (success && user && token) {
					self.isAuth = true;
					self.token = token;
					saveToken(token);
					root.user.setUser(user);
				}
			} catch (err) {
				console.error("Failed to check status ", err);
			}
		});

		return {
			setCredentials,
			getToken,
			reset,
			status,
			login,
			register,
			logout,
		}
	});
