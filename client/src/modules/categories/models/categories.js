/**
 * Description of categories.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 23.05.18 14:21
 */
import {types, flow, getRoot} from 'mobx-state-tree';
import {AbstractStore}  from '../../core/models/abstractStore';
import setPropertyBehavior from '../../../modules/core/models/setPropertyBehavior';
import storeSelectionBehavior from '../../../modules/core/models/storeSelectionBehavior';
import config from '../../../utils/config';
import request from '../../../utils/request';

const {apiPrefix} = config;
const {categoryRestUrl, checkCategoryPatterns} = config[apiPrefix];

const BaseCategoryModel = types
	.model({
		id  : types.identifier(types.number),
		name: types.string,
	});

export const CategoryModel = types.compose(
	BaseCategoryModel,
	setPropertyBehavior()
).named('CategoryModel');

export const CategoriesStore = types
	.compose(
		AbstractStore,
		storeSelectionBehavior(),
		types
			.model({
				restUrl  : categoryRestUrl,
				data     : types.optional(types.array(CategoryModel), []),
				useNotify: true,
			})
	)
	.actions(self => {

		const _remove = self.remove;
		const remove = flow(function*(data, params) {
			const url = checkCategoryPatterns.replace(':id', data.id);
			const {success, canRemove, message} = yield request({url: url, method: 'POST'});
			if (success && canRemove) {
				yield _remove(data, params);
			} else {
				getRoot(self).error(message);
			}
		});

		return {
			remove
		}
	})
	.named('CategoriesStore');
