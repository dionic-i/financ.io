/**
 * Description of amounts.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 30.06.18 13:50
 */
import {types} from 'mobx-state-tree';
import {AbstractStore}  from '../../core/models/abstractStore';
import moment from 'moment';
import setPropertyBehavior from '../../../modules/core/models/setPropertyBehavior';
import storeParamsBehavior  from '../../core/models/storeParamsBehavior';
import storeChangePeriodBehavior  from '../../core/models/storeChangePeriodBehavior';
import {DEFAULT_DATE_FORMAT} from '../../core/models/constants';
import config from '../../../utils/config';

const {apiPrefix} = config;
const {amountByCategoryUrl} = config[apiPrefix];

const BaseAmountModel = types
	.model({
		id    : types.identifier(types.number),
		name  : types.string,
		amount: types.number
	});

export const AmountModel = types.compose(
	BaseAmountModel,
	setPropertyBehavior()
).named('AmountModel');

export const AmountsStore = types
	.compose(
		AbstractStore,
		storeParamsBehavior({
			params: {
				start: {
					type : 'string',
					value: moment().startOf('month').format(DEFAULT_DATE_FORMAT)
				},
				end  : {
					type : 'string',
					value: moment().endOf('month').format(DEFAULT_DATE_FORMAT)
				},
				cards: {
					type : 'array',
					value: []
				}
			}
		}),
		storeChangePeriodBehavior(),
		types
			.model({
				url : amountByCategoryUrl,
				data: types.optional(types.array(AmountModel), [])
			})
	)
	.named('AmountsStore');
