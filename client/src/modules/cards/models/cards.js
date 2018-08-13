/**
 * Description of cards.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 08.05.18 13:40
 */
import {types, flow, getRoot} from 'mobx-state-tree';
import {AbstractStore}  from '../../core/models/abstractStore';
import setPropertyBehavior from '../../../modules/core/models/setPropertyBehavior';
import storeSelectionBehavior from '../../../modules/core/models/storeSelectionBehavior';
import {fetchData} from '../../core/services/commonService';
import config from '../../../utils/config';

const {apiPrefix} = config;
const {cardRestUrl, checkCardsOperation} = config[apiPrefix];

const BaseCardModel = types
	.model({
		id     : types.identifier(types.number),
		name   : types.string,
		desc   : types.string,
		type   : types.number,
		total  : types.number,
		opCount: types.optional(types.number, 0)
	});

export const CardModel = types.compose(
	BaseCardModel,
	setPropertyBehavior()
).named("CardModel");

export const CardsStore = types
	.compose(
		AbstractStore,
		storeSelectionBehavior({
			selType: 'check'
		}),
		types
			.model({
				restUrl: cardRestUrl,
				data   : types.optional(types.array(CardModel), [])
			})
	)
	.actions(self => {

		const _remove = self.remove;
		const remove = flow(function*(data, params) {
			const url = checkCardsOperation.replace(':id', data.id);
			const {success, count, message} = yield fetchData(url);

			if (success && count === 0) {
				yield _remove(data, params);
			} else {
				getRoot(self).error(message);
			}
		});

		return {
			remove
		}
	})
	.named("CardsStore");



