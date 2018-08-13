/**
 * Description of patterns.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 23.05.18 14:21
 */
import {types, flow, getRoot} from 'mobx-state-tree';
import {AbstractStore}  from '../../core/models/abstractStore';
import setPropertyBehavior from '../../../modules/core/models/setPropertyBehavior';
import config from '../../../utils/config';
import {CategoryModel} from './categories';
import {saveData} from '../../core/services/commonService';

const {apiPrefix} = config;
const {patternRestUrl, patternByCatUrl, patternAddToCategoryUrl} = config[apiPrefix];

const BasePatternModel = types
	.model({
		id      : types.identifier(types.number),
		name    : types.string,
		search  : types.string,
		category: types.maybe(types.reference(types.late(() => CategoryModel)))
	});

const PatternModel = types.compose(
	BasePatternModel,
	setPropertyBehavior()
).named('PatternModel');

export const PatternsStore = types
	.compose(
		AbstractStore,
		types
			.model({
				restUrl: patternRestUrl,
				data   : types.optional(types.array(PatternModel), []),
				useNotify: true
			})
	)
	.actions(self => {

		const loadByCategory = flow(function *(id) {
			const url = patternByCatUrl.replace(':id', id);
			yield self.loadFrom(url);
		});

		const addToCategory = flow(function *(values, item) {

			try {
				self.isLoading = true;
				const {success, message, payload} = yield saveData(patternAddToCategoryUrl, 'PUT', values);
				if (success) {
					const {transaction} = payload;
					if (transaction) {
						item.setProperty('category', transaction.category);
					}
					getRoot(self).message('Шаблон успешно добавлен.');
				}
				else {
					getRoot(self).error(message);
				}

				self.isLoading = false;
			} catch (err) {
				self.isLoading = false;
				getRoot(self).error(err.message);
			}

		});

		const getPatternsCountByCategory = (id) => {
			const patterns = self.data.filter(item => item.category.id === id);
			return patterns.length;
		};

		return {
			loadByCategory,
			addToCategory,
			getPatternsCountByCategory
		}
	})
	.named("PatternsStore");
