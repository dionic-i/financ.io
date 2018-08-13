/**
 * Description of operations.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 09.06.18 18:52
 */
import {types, getParent, flow, getRoot} from 'mobx-state-tree';
import moment from 'moment';
import {AbstractStore}  from '../../core/models/abstractStore';
import setPropertyBehavior from '../../../modules/core/models/setPropertyBehavior';
import storeParamsBehavior from '../../../modules/core/models/storeParamsBehavior';
import storeChangePeriodBehavior from '../../../modules/core/models/storeChangePeriodBehavior';
import {CardModel} from './cards';
import {CategoryModel} from '../../categories/models/categories';
import config from '../../../utils/config';
import {DEFAULT_DATE_FORMAT} from '../../core/models/constants';
import {saveData} from '../../core/services/commonService';

const {apiPrefix} = config;
const {operationsRestUrl, operationsRemoveUrl, operationsSyncCategoryUrl} = config[apiPrefix];


export const BaseOperationModel = types
	.model({
		id       : types.identifier(types.number),
		full     : types.string,
		short    : types.maybe(types.string),
		iddate   : types.string,
		createdAt: types.string,
		type     : types.number,
		amount   : types.number,
		card     : types.maybe(types.reference(types.late(() => CardModel))),
		category : types.maybe(types.reference(types.late(() => CategoryModel)))
	});

export const OperationModel = types.compose(
	BaseOperationModel,
	setPropertyBehavior(),
	types.model({}).actions(self =>({
		setCategory(value) {
			self.category = value === 0 ? null : value;
		}
	}))
).named('OperationModel');

export const OperationStore = types
	.compose(
		AbstractStore,
		setPropertyBehavior(),
		storeParamsBehavior({
			params: {
				card_id: {
					type: 'integer',
					value: 0
				},
				start: {
					type: 'string',
					value: moment().startOf('month').format(DEFAULT_DATE_FORMAT)
				},
				end: {
					type: 'string',
					value: moment().endOf('month').format(DEFAULT_DATE_FORMAT)
				}
			}
		}),
		storeChangePeriodBehavior(),
		types.model({
			restUrl       : operationsRestUrl,
			removeRangeUrl: operationsRemoveUrl,
			data          : types.optional(types.array(OperationModel), []),
			useNotify     : true,
		}).actions(self => {

			/**
			 * Override methods
			 */

			function updateCard(payload) {
				const card = getUi().card;
				card.setProperties({...payload}, true);
			}

			const _afterRemove = self.afterSuccessRemoveRange;
			const afterSuccessRemoveRange = (count, payload) => {
				_afterRemove.apply(self, [count]);
				self.data = [];
				updateCard(payload);
			};

			const _afterRemoveOne = self.afterSuccessRemove;
			const afterSuccessRemove = (payload) => {
				_afterRemoveOne.apply(self, [payload]);
				updateCard(payload);
			};

			const _afterCreate = self.afterSuccessCreate;
			const afterSuccessCreate = (record, payload) => {
				_afterCreate.apply(self, [payload]);
				updateCard(payload);
			};

			const _afterUpdate = self.afterSuccessUpdate;
			const afterSuccessUpdate = (record, payload) => {
				_afterUpdate.apply(self, [payload]);
				updateCard(payload);
			};

			const getUi = () => {
				return getParent(self, 2).uiSingleCard;
			};

			const sync = flow(function* sync() {
				const root = getRoot(self);

				try {
					self.isLoading = true;

					const params = self.getParams();

					const {records, payload, success, message, errors} = yield saveData(
						operationsSyncCategoryUrl,
						'POST',
						{
							card : params.card_id,
							start: params.start,
							end  : params.end
						}
					);

					self.isLoading = false;

					if (success) {
						records.forEach(record => {
							const oper = self.find(record);
							if (oper) {
								oper.setCategory(record.category)
							}
						});

						// Show notification
						const {find, updated} = payload;
						const title = 'Категории операций успешно синхронизированы!';
						const description = `Найдено категорий: ${find}. \n Установлено категорий: ${updated}.`;

						root.notify(title, description);

					} else {
						root.showErrorMessages(message, errors);
					}
				} catch (err) {
					self.isLoading = false;
					root.serverNoResponse();
				}
			});

			return {
				afterSuccessCreate,
				afterSuccessUpdate,
				afterSuccessRemove,
				afterSuccessRemoveRange,
				sync
			}
		})
	).named('OperationStore');
