/**
 * Description of ui-reports.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.07.18 15:18
 */
import {types, flow, getRoot, applySnapshot} from 'mobx-state-tree';
import {CategoriesAmountReportStore, CardsAmountReportStore} from './reports';

export const initialUiReports = {
	activeReportKey : 'by-categories',
	categoriesAmount: {},
	cardsAmount     : {},
};

export const uiReports = types
	.model({
		title           : 'Страница отчетов',
		activeReportKey : types.string,
		categoriesAmount: types.optional(CategoriesAmountReportStore, {}),
		cardsAmount     : types.optional(CardsAmountReportStore, {}),
	})
	.actions(self => {

		const setInitialState = () => {
			applySnapshot(self, initialUiReports);
		};

		const load = flow(function* load() {
			const cards = getCardsStore();
			if (!cards.isLoaded) {
				yield cards.load();
			}

			const categories = getCategoriesStore();
			if (!categories.isLoaded) {
				yield categories.load();
			}
		});

		function getCardsStore() {
			return getRoot(self).uiDashboard.cards;
		}

		function getCategoriesStore() {
			return getRoot(self).uiCategories.categories;
		}

		const changeReportType = (key) => {
			self.activeReportKey = key;
		};

		return {
			load,
			changeReportType,
			getCardsStore,
			getCategoriesStore,
			setInitialState
		}

	}).named('uiReports');
