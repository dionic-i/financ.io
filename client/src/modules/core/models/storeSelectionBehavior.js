/**
 * Description of storeSelectionBehavior.
 * Behavior witch can help to choice records.
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 30.06.18 11:00
 */
import {types, getParent} from 'mobx-state-tree';
import _ from 'lodash';

function storeSelectionBehavior({keyName = 'id', dataName = 'data', selType = 'radio'} = {}) {

	return types.model({
		keyName,
		dataName,
		selType  : types.optional(types.enumeration('selType', ['radio', 'check']), selType),
		selection: types.optional(types.array(types.number), []),
	}).actions(self => {

		const afterCreate = function () {
			if (!self.keyName) {
				throw new Error('Selection keyName must be set!');
			}
			if (!self.dataName) {
				throw new Error('Selection dataName must be set!');
			}
		};

		const resetSelection = function () {
			self.selection = [];
		};

		const select = function (records) {
			const data = _.isArray(records) ? records : [records];

			if (self.selType === 'radio') {
				resetSelection();
			}
			for (let record of data) {
				const key = self.keyName;
				if (self.selection.indexOf(record[key]) === -1) {
					self.selection.push(record[self.keyName]);
				}
			}
		};

		const deselect = function (records) {
			const key = self.keyName;
			self.selection = self.selection.filter(item => {
				for (let record of records) {
					if (item !== record[key]) {
						return item;
					}
				}
				return false;
			});
		};

		const getSelection = function (onlyKeys = false) {
			let result = [];

			if (onlyKeys) {
				return self.selection.toJS();
			}

			const data = self[self.dataName] || getParent(self);

			if (data && data.length) {
				result = data.filter((item) => {
					return self.selection.indexOf(item[self.keyName]) !== -1
				});
			}

			return result;
		};

		return {
			afterCreate,
			select,
			deselect,
			resetSelection,
			getSelection
		}
	}).views(self => ({

		get firstSelectKey() {
			const selection = self.getSelection(true);
			return selection.length > 0 ? selection[0] : -1;
		},

		get firstSelectItem() {
			const selection = self.getSelection();
			return selection.length > 0 ? selection[0] : null;
		},

		get hasSelection() {
			return self.selection.length > 0
		},

		get selCount() {
			return self.selection.length
		}

	}));
}

export default storeSelectionBehavior;
