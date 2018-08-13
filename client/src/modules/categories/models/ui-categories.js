/**
 * Description of ui-categories.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 23.05.18 14:21
 */
import {types, flow, applySnapshot} from 'mobx-state-tree';
import {CategoriesStore} from './categories';
import {PatternsStore} from './patterns';

const initialState = {
	categories : {},
	patterns   : {},
	isFirstLoad: true
};

export const uiCategories = types
	.model({
		title      : 'Страница категорий потребления',
		categories : types.optional(CategoriesStore, {}),
		patterns   : types.optional(PatternsStore, {}),
		isFirstLoad: true
	})
	.actions(self => {

		const setInitialState = () => {
			applySnapshot(self, initialState);
		};

		const load = flow(function* load(reload = true) {
			yield self.categories.load(reload);
		});

		const loadCategories = flow(function* loadCategories() {
			if (self.isFirstLoad) {
				yield self.categories.load();

				const first = self.categories.first;
				if (first) {
					self.categories.select(first);
					yield self.loadPatterns(first.id);
				}
				self.isFirstLoad = false;
			}
		});

		const loadPatterns = flow(function* load(id) {
			yield self.patterns.loadByCategory(id);
		});

		return {
			load,
			loadCategories,
			loadPatterns,
			setInitialState
		}
	})
	.named("uiCategories");
