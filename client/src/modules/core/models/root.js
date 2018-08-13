/**
 * Description of RootModel.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.04.18 11:04
 */
import {types} from 'mobx-state-tree';

import {MenuItems} from '../../../common/models/menu';
import {AuthModel, initialAuth} from '../../../modules/users/models/auth';
import {UserModel, initialUser} from '../../../modules/users/models/user';
import {uiDashboard} from '../../../modules/dashboard/models/ui-dashboard';
import {uiSingleCard} from '../../../modules/cards/models/ui-single-card';
import {uiCategories} from '../../../modules/categories/models/ui-categories';
import {uiReports, initialUiReports} from '../../../modules/reports/models/ui-reports';
import {Message, Notification, ErrorStore, SUCCESS_NOTE, ERROR_NOTE} from '../../../modules/core/models/errorStore';

export const RootModel = types
	.model({
		// Common
		appName      : 'Finance.io',
		appLoaded    : false,
		auth         : types.optional(AuthModel, initialAuth),
		user         : types.optional(UserModel, initialUser),
		menu         : types.optional(MenuItems, {}),
		messages     : types.optional(types.array(Message), []),
		notifications: types.optional(types.array(Notification), []),
		errors       : types.optional(ErrorStore, {}),

		// Pages
		uiDashboard : types.optional(uiDashboard, {}),
		uiSingleCard: types.optional(uiSingleCard, {}),
		uiCategories: types.optional(uiCategories, {}),
		uiReports   : types.optional(uiReports, initialUiReports),
	})
	.actions(self => ({

		afterCreate() {
			self.auth.status();
			self.menu.load().then(() => {
				self.setLoading(true);
			})
		},

		setLoading(value) {
			self.appLoaded = value;
		},

		notify(title, description, type = SUCCESS_NOTE) {
			self.notifications.push({title, description, type});
		},

		message(message, type = SUCCESS_NOTE) {
			self.messages.push({message, type});
		},

		error(message, type = ERROR_NOTE) {
			self.messages.push({message, type});
		},

		serverNoResponse() {
			self.error('Ошибка ответ сервера. Попробуйте повторить запрос позже.');
		},

		showErrorMessages(message, errors) {
			if (errors.length > 0) {
				const errorsItems = errors.map(item => {
					return {
						param: item.param,
						msg  : item.msg
					};
				});
				self.errors.list.push({
					title: 'Ошибки параметров запроса',
					list : errorsItems
				})
			}
			else {
				const msg = message.length > 0 ? message : 'Неизвестная ошибка сервера.';
				self.error(msg);
			}
		},

		clearMessages() {
			self.messages = [];
		},

		clearNotifications() {
			self.messages = [];
		},

		setInitialState() {
			self.auth = initialAuth;
			self.user = initialUser;
			self.messages =  [];
			self.notifications =  [];
			self.errors =  {};

			self.uiDashboard.setInitialState();
			self.uiSingleCard.setInitialState();
			self.uiCategories.setInitialState();
			self.uiReports.setInitialState();
		}

	}))
	.views(self => ({
		get isAuth() {
			return self.auth.isAuth;
		}
	}));
