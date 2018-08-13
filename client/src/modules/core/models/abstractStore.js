/**
 * Description of AbstractStore.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 25.04.18 9:24
 */
import {types, detach, flow, getRoot} from 'mobx-state-tree';
import {fetchData, saveData} from '../services/commonService';


export const AbstractStore = types.model({
	url           : '',
	createUrl     : '',
	updateUrl     : '',
	removeUrl     : '',
	removeRangeUrl: '',
	restUrl       : '',
	data          : types.undefined,
	isLoaded      : false,
	isLoading     : false,
	depth         : types.optional(types.number, 0),
	useNotify     : false
}).actions(self => {

	// Private

	const createUrl = function (method, data) {
		let url = '';

		if (self.restUrl) {
			if (method === 'GET') {
				url = self.restUrl.replace(':id', data.id ? data.id : '');
			} else {
				url = self.restUrl.replace(':id', (method !== 'PUT') ? data.id : '');
			}
		} else {
			switch (method) {
				case 'GET':
					url = self.url;
					break;
				case 'PUT':
					url = self.createUrl;
					break;
				case 'POST':
					url = self.updateUrl;
					break;
				case 'DELETE':
					url = self.removeUrl;
					break;
				default:
					url = self.url;
					break;
			}
		}

		return url;
	};

	const endSuccessAction = function () {
		self.isLoaded = true;
		self.isLoading = false;
	};

	const endErrorLoading = function (errors) {
		self.isLoaded = false;
		self.isLoading = false;
		// TODO: Do error showing
		self.afterError();
	};

	const endExceptionLoading = function (url, params, e) {
		self.isLoaded = false;
		self.isLoading = false;
		console.error(`Error to do create action ${url}`, params, e);
	};

	function getParams() {
		return self.params ? self.getParams() : {};
	}

	// Public actions

	const loadRecords = function (data) {
		endSuccessAction();
		self.data = [];
		self.data = data;
	};

	const clearRecords = function () {
		self.data = [];
		self.isLoaded = false;
	};

	const load = flow(function* load(reload = true, params = {}) {
		const baseParams = getParams();
		const mergedParams = {...baseParams, ...params};
		const url = createUrl('GET', mergedParams);

		if (!self.isLoaded || reload) {
			try {
				self.isLoading = true;
				const {success, records, errors, message} = yield fetchData(url, mergedParams);
				if (success) {
					const data = records && records.length > 0 ? records : [];
					loadRecords(data);
				} else {
					endErrorLoading(errors, message);
				}
			} catch (err) {
				endExceptionLoading(url, params, err);
			}
		}
	});

	const create = flow(function*(data) {
		const url = createUrl('PUT', data);

		try {
			self.isLoading = true;

			const {success, record, errors, payload} = yield saveData(url, 'PUT', data);

			if (success) {
				endSuccessAction();
				self.data.push(record);
				self.afterSuccessCreate(record, payload);
			}
			else {
				endErrorLoading(errors);
			}
		} catch (err) {
			endExceptionLoading(url, data, err);
		}
	});

	const update = flow(function*(item, data) {
		const url = createUrl('POST', item);

		try {
			self.isLoading = true;

			const {success, record, errors, payload} = yield saveData(url, 'POST', data);

			if (success) {
				endSuccessAction();
				item.setProperties(data);
				self.afterSuccessUpdate(record, payload);
			}
			else {
				endErrorLoading(errors);
			}
		} catch (err) {
			endExceptionLoading(url, data, err);
		}
	});

	const remove = flow(function*(data, params) {
		const url = createUrl('DELETE', data);

		try {
			self.isLoading = true;

			const {success, errors, payload} = yield saveData(url, 'DELETE', params);

			if (success) {
				endSuccessAction();
				detach(data);
				self.afterSuccessRemove(payload);
			}
			else {
				endErrorLoading(errors);
			}
		} catch (err) {
			endExceptionLoading(url, data, err);
		}
	});

	const removeRange = flow(function*(params) {
		const url = self.removeRangeUrl || '';

		try {
			self.isLoading = true;

			const {removed, success, errors, payload} = yield saveData(url, 'DELETE', params);

			if (success) {
				endSuccessAction();
				self.afterSuccessRemoveRange(removed, payload);
			}
			else {
				endErrorLoading(errors);
			}
		} catch (err) {
			endExceptionLoading(url, params, err);
		}
	});

	const loadFrom = flow(function* load(url, params) {
		try {
			self.isLoading = true;
			const {success, records, errors} = yield fetchData(url, params);
			if (success) {
				const data = records && records.length > 0 ? records : [];
				loadRecords(data);
			} else {
				endErrorLoading(errors);
			}
		} catch (err) {
			endExceptionLoading(url, params, err);
		}
	});

	/**
	 * Events
	 */

	const afterSuccessCreate = function (record, payload) {
		if (self.useNotify) {
			getRoot(self).message('Запись успешно добавлена.');
		}
	};

	const afterSuccessUpdate = function (record, payload) {
		if (self.useNotify) {
			getRoot(self).message('Запись успешно обновлена.');
		}
	};

	const afterSuccessRemove = function (payload) {
		if (self.useNotify) {
			getRoot(self).message('Запись успешно удалена.');
		}
	};

	const afterSuccessRemoveRange = function (count, payload) {
		if (self.useNotify) {
			getRoot(self).message(`Записи успешно удалены (${count})`);
		}
	};

	const afterError = function () {
		if (self.useNotify) {
			getRoot(self).error('Ошибка операции с записью.');
		}
	};

	/**
	 * Local sync actions
	 */
	const addRecord = (record) => {
		self.data.push(record);
	};

	const find = function (record) {
		return self.data.find(item => item.id === record.id);
	};

	const getAt = function (index) {
		return self.data.length < index && index >= 0 ? self.data[index] : null;
	};

	return {
		// Sync actions
		loadRecords,
		clearRecords,
		addRecord,

		// Async actions
		load,
		loadFrom,
		create,
		update,
		remove,
		removeRange,

		// Hooks
		afterSuccessCreate,
		afterSuccessUpdate,
		afterSuccessRemove,
		afterSuccessRemoveRange,
		afterError,
		endSuccessAction,
		endErrorLoading,
		endExceptionLoading,

		// Local methods
		find,
		getAt
	}

}).views(self => ({

	get hasErrors() {
		return self.errors.length > 0;
	},

	get totalCount() {
		return self.data.length;
	},

	get first() {
		return self.data.length > 0 ? self.data[0] : null;
	},

	get last() {
		return self.data.length > 0 ? self.data[self.data.length - 1] : null;
	},

	range(start, end) {
		return self.data.slice(start, end);
	}

}));
