/**
 * Description of storeChangePeriodBehavior.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 09.07.18 10:06
 */
import {types} from 'mobx-state-tree';
import moment from 'moment';
import {DEFAULT_DATE_FORMAT} from '../../core/models/constants';

export const MONTH = 'month';
export const YEAR = 'year';


function storeChangePeriodBehavior(config = {}) {

	const {
		startParam = 'start',
		endParam = 'end',
		reloadWhenChange = true,
		type = MONTH
	} = config;

	return types.model({}).actions(self => {

		const changePeriod = (dates) => {
			self.setParams({
				[startParam]: dates[0].format(DEFAULT_DATE_FORMAT),
				[endParam]  : dates[1].format(DEFAULT_DATE_FORMAT),
			});
			if (reloadWhenChange) {
				self.load();
			}
		};

		const nextPeriod = () => {
			let nextMonthB,
				nextMonthE;

			const start = self.getParam(startParam);

			if (type === MONTH) {
				nextMonthB = moment(start).startOf('month').add(1, 'month');
				nextMonthE = moment(start).add(1, 'month').endOf('month');
			}
			else {
				nextMonthB = moment(start).startOf('year').add(1, 'year');
				nextMonthE = moment(start).add(1, 'year').endOf('year');
			}

			self.changePeriod([nextMonthB, nextMonthE]);
		};

		const prevPeriod = () => {
			let prevMonthB,
				prevMonthE;

			const start = self.getParam(startParam);

			if (type === MONTH) {
				prevMonthB = moment(start).startOf('month').add(-1, 'month');
				prevMonthE = moment(start).add(-1, 'month').endOf('month');
			}
			else {
				prevMonthB = moment(start).startOf('year').add(-1, 'year');
				prevMonthE = moment(start).add(-1, 'year').endOf('year');
			}

			self.changePeriod([prevMonthB, prevMonthE])
		};

		const currentPeriod = () => {
			let start,
				end;

			if (type === MONTH) {
				start = moment().startOf('month');
				end = moment().endOf('month');
			} else {
				start = moment().startOf('year');
				end = moment().endOf('year');
			}

			self.changePeriod([start, end]);
		};

		return {
			changePeriod,
			nextPeriod,
			prevPeriod,
			currentPeriod
		}
	});
}

export default storeChangePeriodBehavior;
