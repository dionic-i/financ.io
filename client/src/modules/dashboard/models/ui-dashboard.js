/**
 * Description of ui-dashboard.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 08.05.18 13:40
 */
import {types, flow, getRoot, applySnapshot, onPatch} from 'mobx-state-tree';
import {AmountsStore} from './amounts';
import {CardsStore} from '../../cards/models/cards';
import uniq from 'lodash/uniq';

const initialState = {
	cards            : {},
	amounts          : {},
	excludeCategories: [0],
	isFirstLoad      : true
};

export const uiDashboard = types
	.model({
		title            : 'Главная страница приложения',
		cards            : types.optional(CardsStore, {}),
		amounts          : types.optional(AmountsStore, {}),
		excludeCategories: types.optional(types.array(types.number), [0]),
		isFirstLoad      : true
	})
	.actions(self => {

		function afterCreate() {
			onPatch(self.cards.data, patch => {
				const root = getRoot(self);
				root.menu.load();
			});
		}

		const setInitialState = () => {
			applySnapshot(self, initialState);
		};

		const load = flow(function* load() {
			if (self.isFirstLoad) {
				yield self.cards.load();
				if (self.cards.totalCount > 0) {
					self.cards.select(self.cards.first);
					self.amounts.setParam('cards', self.cards.getSelection(true));
					yield self.amounts.load();
				}
				self.isFirstLoad = false;
			}
		});

		const selectCard = function () {
			if (self.cards.hasSelection) {
				self.amounts.setParam('cards', self.cards.getSelection(true));
				self.amounts.load();
			}
			else {
				self.amounts.clearRecords();
			}
		};

		function getUser() {
			return getRoot(self).user;
		}

		const updateExcludedCategories = () => {
			const {profile} = getUser();
			self.excludeCategories = uniq([...self.excludeCategories, ...profile.excludeGraphCategories]);
		};

		return {
			selectCard,
			load,
			updateExcludedCategories,
			setInitialState,
			afterCreate
		}

	}).named('uiDashboard');
