/**
 * Description of transactions.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 09.06.18 18:52
 */
import {types, flow, detach, getParent} from 'mobx-state-tree';
import {fetchData, saveData} from '../../core/services/commonService';
import storeSelectionBehavior  from '../../core/models/storeSelectionBehavior';
import config from '../../../utils/config';

const {apiPrefix} = config;
const {cardFileOperationsUrl, uploadTransactionsUrl} = config[apiPrefix];

const Item = types
	.model({
		field: types.string,
		value: types.string
	}).actions(self => {
			const setFieldName = (name) => {
				self.field = name;
			};
			return {
				setFieldName
			}
		}
	);

export const GhostTransactionModel = types
	.model({
		id    : types.identifier(types.number),
		record: types.array(Item)
	});

const GhostTableColumn = types
	.model({
		title    : types.string,
		dataIndex: types.string,
		isCustom : false,
	}).actions(self => {
			const setOptions = (options) => {
				self.title = options.title || 'Поле';
				self.dataIndex = options.dataIndex || 'field';
				self.isCustom = options.isCustom
			};
			return {
				setOptions
			}
		}
	);

const GhostField = types
	.model({
		column  : types.string,
		title   : types.string,
		selected: false
	}).actions(self => {
			const setSelected = (value) => {
				self.selected = value;
			};
			return {
				setSelected
			}
		}
	);

export const GhostTransactionStore = types
	.compose(
		storeSelectionBehavior({
			selType: 'check'
		}),
		types.model({
			columns  : types.optional(types.array(GhostTableColumn), []),
			data     : types.optional(types.array(GhostTransactionModel), []),
			fields   : types.optional(types.map(GhostField), {}),
			isLoading: false
		}).actions(self => {

			const setColumns = (columns) => {
				self.columns = columns;
			};

			const setData = (data) => {
				self.data = data;
			};

			const setFields = (fields) => {
				self.fields = fields;
			};

			const setOptions = (data) => {
				const {columns = [], defaultFields = {}, records = []} = data;
				self.setColumns(columns);
				self.setFields(defaultFields);
				self.setData(records);
			};

			const clearAll = () => {
				self.setOptions({
					records      : [],
					columns      : [],
					defaultFields: {}
				})
			};

			const load = flow(function* load(idCard, idFile) {
				try {
					self.isLoading = true;
					const url = cardFileOperationsUrl.replace(':id', idCard).replace(':file_id', idFile);
					const {success, data} = yield fetchData(url);

					if (success) {
						self.setOptions(data);
					}

					self.isLoading = false;
				} catch (err) {
					self.isLoading = false;
				}
			});

			function changeDataColumnName(newName, oldName) {
				self.data.forEach(item => {
					const record = item.record.find((rec) => rec.field === oldName);
					if (record) {
						record.setFieldName(newName);
					}
				});
			}

			const setColumnType = (key, column) => {
				if (self.fields.has(key)) {
					// Set that field is selected
					const field = self.fields.get(key);
					field.setSelected(true);

					// Change the data
					changeDataColumnName(key, column.dataIndex);

					// Change column options
					column.setOptions({
						title    : field.title,
						dataIndex: key,
						isCustom : true
					});
				}
			};

			const resetColumnType = (column) => {
				const key = column.dataIndex;
				if (self.fields.has(key)) {

					// Set that field is selected
					const field = self.fields.get(key);
					field.setSelected(false);

					// Find first free field index.
					let columnOptions;
					const columns = self.columns.map(item => item.dataIndex);
					for (let i = 0; i < 100; i++) {
						if (columns.indexOf('field' + i) === -1) {
							columnOptions = {
								title    : 'Поле ' + i,
								dataIndex: 'field' + i,
								isCustom : false
							};
							break;
						}
					}

					// Change the data
					changeDataColumnName(columnOptions.dataIndex, column.dataIndex);

					// Change column options
					column.setOptions(columnOptions);
				}
			};

			const mergeColumns = (names) => {
			};

			const removeColumn = (column) => {
				if (!self.fields.has(column.dataIndex)) {
					self.columns = self.columns.filter(item => item.dataIndex !== column.dataIndex);
				}
			};

			const removeTransactions = () => {
				const records = self.getSelection();
				self.resetSelection();
				records.forEach(item => {
					detach(item);
				});
			};

			function getTransactions() {
				return self.data.map(item => {
					let transaction = {};
					for (let [index] of self.fields) {
						const record = item.record.find(rec => rec.field === index);
						if (record) {
							transaction[index] = record.value;
						}
					}

					return transaction;
				});
			}

			const save = flow(function* save(cardId, fileId) {
				try {
					self.isLoading = true;

					// Collect send transactions
					const opers = getTransactions();

					const {data, payload, success} = yield saveData(
						uploadTransactionsUrl,
						'PUT',
						{
							card: cardId,
							file: fileId,
							opers: opers
						}
					);

					self.isLoading = false;

					if (success) {
						return {
							...data,
							...payload
						};
					} else {
						// TODO: show error
					}
				} catch (err) {
					self.isLoading = false;
				}
			});

			const getUi = () => {
				return getParent(self, 2).uiSingleCard;
			};

			return {
				load,
				save,

				setColumns,
				setData,
				setFields,
				setOptions,
				clearAll,
				getUi,

				removeColumn,
				mergeColumns,
				setColumnType,
				resetColumnType,
				removeTransactions,
			}
		})
	).views(self => {

		const hasNotSelectedField = () => {
			for (let field of self.fields.values()) {
				if (field.selected === false) {
					return true;
				}
			}
			return false;
		};

		const unSelectedFields = () => {
			let result = [];
			for (let [index, field] of self.fields) {
				if (field.selected === false) {
					result.push({
						index,
						title : field.title,
						column: field.column
					});
				}
			}
			return result;
		};

		const getTotalAmount = () => {
			let plus = 0,
				minus = 0,
				total = 0;

			let isAmountSelect = 0;
			for (let [index, field] of self.fields) {
				if (index === 'amount' && field.selected) {
					isAmountSelect++;
				}
				if (index === 'type' && field.selected) {
					isAmountSelect++;
				}
			}

			if (isAmountSelect === 2) {

				self.data.forEach(item => {
					const amountRecord = item.record.find(record => record.field === 'amount');
					const typeRecord = item.record.find(record => record.field === 'type');

					const value = parseFloat(amountRecord.value, 10);
					const sign = parseInt(typeRecord.value, 10);

					if (sign === 1) {
						plus += value;
					}
					else if (sign === 0) {
						minus += value;
					}
				});

				plus = Math.round(plus);
				minus = Math.round(minus);
				total = plus - minus;
			}

			return {
				plus,
				minus,
				total
			};
		};

		const getRecordsCount = () => {
			return self.data.length;
		};

		return {
			hasNotSelectedField,
			unSelectedFields,
			getTotalAmount,
			getRecordsCount
		}
	});
