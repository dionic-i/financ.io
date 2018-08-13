/**
 * Description of profile.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.07.18 9:10
 */
import {types, flow, getRoot} from "mobx-state-tree"
import config from '../../../utils/config';
import {saveData, fetchData} from '../../core/services/commonService';
import _ from 'lodash';

const {apiPrefix} = config;
const {profileUrl, settingsUrl, removeAvatarUrl} = config[apiPrefix];


export const initialUserProfile = {
	id        : 0,
	username  : '',
	firstname : '',
	secondname: '',
	birthday  : '',
	lastActive: '',
	avatar    : '',
	settings  : {}
};

const initialUserSettings = {
	excludeGraphCategories: []
};

export const UserProfileModel = types
	.model({
		id        : 0,
		username  : '',
		firstname : types.maybe(types.string),
		secondname: types.maybe(types.string),
		birthday  : types.maybe(types.string),
		lastActive: types.maybe(types.string),
		settings  : types.optional(types.frozen, initialUserSettings),
		avatar    : types.maybe(types.string),
		isLoading : false
	})
	.actions(self => {

		const setIsLoading = (status) => {
			self.isLoading = status;
		};

		const setAvatar = (source) => {
			self.avatar = source;
		};

		const save = flow(function* save(values) {
			const url = profileUrl.replace(':id', self.id);

			try {
				self.isLoading = true;

				const {success, record, message} = yield saveData(url, 'POST', values);

				if (success) {
					const {firstname, secondname, birthday, lastActive, settings} = record;
					self.firstname = firstname;
					self.secondname = secondname;
					self.birthday = birthday;
					self.lastActive = lastActive;
					self.settings = settings;
					getRoot(self).message('Профиль успешно сохранен.');
				}
				else {
					getRoot(self).error('Ошибка сохранения профиля. Описание: ' + message);
				}
				self.isLoading = false;
			} catch (err) {
				getRoot(self).error('Ошибка сохранения профиля.');
				self.isLoading = false;
			}
		});

		const load = flow(function* load() {
			const url = profileUrl.replace(':id', self.id);

			try {
				self.isLoading = true;

				const {success, record, message} = yield fetchData(url);
				if (success) {
					const {firstname, secondname, birthday, lastActive, settings} = record;
					self.firstname = firstname;
					self.secondname = secondname;
					self.birthday = birthday;
					self.lastActive = lastActive;
					self.settings = settings;
				}
				else {
					getRoot(self).error('Ошибка загрузки профиля. Описание: ' + message);
				}

				self.isLoading = false;
			} catch (err) {
				self.isLoading = false;
			}
		});

		const checkCategory = flow(function* check(item, check) {
			const url = settingsUrl.replace(':id', self.id);

			try {
				self.isLoading = true;

				let values = _.cloneDeep(self.settings);
				_.defaults(values, initialUserSettings);

				if (check) {
					values.excludeGraphCategories = values.excludeGraphCategories.filter(id => id !== item.id);
				} else {
					values.excludeGraphCategories.push(item.id);
				}

				const {success, record, message} = yield saveData(url, 'POST', {settings: values});
				if (success) {
					self.settings = record.settings;
				}
				else {
					getRoot(self).error('Ошибка сохранения настроек. Описание: ' + message);
				}

				self.isLoading = false;
			} catch (err) {
				self.isLoading = false;
			}
		});

		const removeAvatar = flow(function* removeAvatar() {
			try {
				self.isLoading = true;

				const {success, item, message} = yield saveData(removeAvatarUrl, 'POST');
				if (success) {
					self.setAvatar(item.avatar);
					getRoot(self).message('Аватарка успешно удалена.');
				}
				else {
					getRoot(self).error('Ошибка удаления аватарки. Описание: ' + message);
				}

				self.isLoading = false;
			} catch (err) {
				self.isLoading = false;
			}
		});

		return {
			load,
			save,
			checkCategory,
			removeAvatar,
			setIsLoading,
			setAvatar
		}
	}).views(self => ({

		get excludeGraphCategories() {
			return self.settings && self.settings.excludeGraphCategories ? self.settings.excludeGraphCategories : [];
		},

		get isDefaultAvatar() {
			return self.avatar.indexOf('default-avatar.jpg') !== -1;
		}

	}));
