/**
 * Description of reports.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 12.07.18 8:23
 */
import {types, flow, getParent} from 'mobx-state-tree';
import moment from 'moment';
import {AbstractStore}  from '../../core/models/abstractStore';
import storeParamsBehavior from '../../../modules/core/models/storeParamsBehavior';
import storeChangePeriodBehavior from '../../../modules/core/models/storeChangePeriodBehavior';
import config from '../../../utils/config';
import {DEFAULT_DATE_FORMAT} from '../../core/models/constants';
import {YEAR} from '../../core/models/storeChangePeriodBehavior';

const {apiPrefix} = config;
const {categoriesAmountReportUrl, cardsAmountReportUrl} = config[apiPrefix];

const CategoryAmountReportModel = types
	.model({
		id    : types.identifier(types.string),
		iddate: types.string,
		amount: types.maybe(types.number)
	});

export const CategoriesAmountReportStore = types
	.compose(
		AbstractStore,
		storeParamsBehavior({
			params: {
				start     : {
					type : 'string',
					value: moment().startOf('year').format(DEFAULT_DATE_FORMAT)
				},
				end       : {
					type : 'string',
					value: moment().endOf('year').format(DEFAULT_DATE_FORMAT)
				},
				categories: {
					type : 'array',
					value: []
				},
				cards     : {
					type : 'array',
					value: []
				}
			}
		}),
		storeChangePeriodBehavior({type: YEAR}),
		types
			.model({
				url        : categoriesAmountReportUrl,
				data       : types.optional(types.array(CategoryAmountReportModel), []),
				isFirstLoad: true
			})
	)
	.actions(self => {

		const selectCategories = (items) => {
			self.setParam('categories', [...items]);
		};

		const selectCards = (items) => {
			self.setParam('cards', [...items]);
		};

		const loadAmounts = flow(function* loadAmounts() {
			if (self.isFirstLoad) {
				const parent = getParent(self);
				yield parent.load();

				const cards = parent.getCardsStore();
				const categories = parent.getCategoriesStore();

				if (cards.first) {
					self.setParam('cards', [cards.first.id]);
				}

				if (categories.first) {
					self.setParam('categories', [categories.first.id]);
				}

				yield self.load();

				self.isFirstLoad = false;
			}
		});

		return {
			selectCategories,
			selectCards,
			loadAmounts
		}
	})
	.views(self => {

		const getGraphConfig = () => {
			let series = [];

			const data = self.data.toJS();

			for (let i = 0; i < data.length; i++) {
				const item = data[i];
				const iddate = moment(item.iddate).format('YYYY-MM');
				series.push([iddate, item.amount]);
			}

			return {
				series
			};
		};

		return {
			getGraphConfig
		}
	})
	.named('CategoriesAmountReportStore');


const CardAmountReportModel = types
	.model({
		id     : types.identifier(types.string),
		iddate : types.string,
		income : types.maybe(types.number),
		outcome: types.maybe(types.number),
		saldo  : types.maybe(types.number)
	});

export const CardsAmountReportStore = types
	.compose(
		AbstractStore,
		storeParamsBehavior({
			params: {
				start: {
					type : 'string',
					value: moment().startOf('year').format(DEFAULT_DATE_FORMAT)
				},
				end  : {
					type : 'string',
					value: moment().endOf('year').format(DEFAULT_DATE_FORMAT)
				},
				cards: {
					type : 'array',
					value: []
				}
			}
		}),
		storeChangePeriodBehavior({type: YEAR}),
		types
			.model({
				url        : cardsAmountReportUrl,
				data       : types.optional(types.array(CardAmountReportModel), []),
				isFirstLoad: true
			})
	)
	.actions(self => {

		const selectCards = (items) => {
			self.setParam('cards', [...items]);
		};

		const loadAmounts = flow(function* loadAmounts() {
			if (self.isFirstLoad) {
				const parent = getParent(self);
				yield parent.load();

				const cards = parent.getCardsStore();

				if (cards.first) {
					self.setParam('cards', [cards.first.id]);
				}

				yield self.load();

				self.isFirstLoad = false;
			}
		});

		return {
			selectCards,
			loadAmounts
		}
	})
	.views(self => {

		const graphConfig = () => {
			let series = [],
				incomeSeria = {
					name: 'Приход',
					data: []
				},
				outcomeSeria = {
					name: 'Расход',
					data: []
				},
				categories = [];

			const data = self.data.toJS();

			for (let i = 0; i < data.length; i++) {
				const item = data[i];
				const iddate = moment(item.iddate).format('YYYY-MM');
				categories.push(iddate);
				incomeSeria.data.push(item.income);
				outcomeSeria.data.push(item.outcome);
			}

			series.push(incomeSeria);
			series.push(outcomeSeria);

			return {
				categories,
				series
			};
		};

		return {
			graphConfig
		}
	})
	.named('CardsAmountReportStore');
