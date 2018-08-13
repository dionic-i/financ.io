/**
 * Description of storeParamsBehavior.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 30.06.18 11:00
 */
import {types, destroy} from 'mobx-state-tree';


const ParamModel = types.model({
	type : types.enumeration('type', ['string', 'integer', 'number', 'date', 'array']),
	value: types.frozen
}).actions(self => {
	const setValue = function (value) {
		self.value = value;
	};
	return {
		setValue
	}
});


function storeParamsBehavior(config = {}) {

	const params = config.params || {};

	return types.model({
		params: types.optional(types.map(ParamModel), params),
	}).actions(self => {

		const addParam = function (name, param) {
			if (!self.params.has(name)) {
				self.params.set(name, param);
			}
		};

		const removeParam = function (name) {
			if (self.params.has(name)) {
				destroy(self.params.get(name));
			}
		};

		const setParam = function (name, value) {
			if (self.params.has(name)) {
				self.params.get(name).setValue(value);
			}
		};

		const setParams = function (params) {
			for (let key in params) {
				if (self.params.has(key)) {
					self.params.get(key).setValue(params[key]);
				}
			}
		};

		const getParam = function (name) {
			return self.params.get(name).value;
		};

		const getParams = function () {
			const result = {};
			for (let [key, param] of self.params) {
				result[key] = param.value;
			}
			return result;
		};

		return {
			addParam,
			removeParam,
			setParam,
			setParams,
			getParam,
			getParams
		}
	}).views(self => ({

		get paramsCount() {
			return self.params.size;
		},

		get hasParams() {
			return self.params.size !== 0;
		}

	}));
}

export default storeParamsBehavior;
