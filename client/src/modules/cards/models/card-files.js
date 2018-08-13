/**
 * Description of card-files.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 08.05.18 13:40
 */
import {types} from 'mobx-state-tree';
import {AbstractStore}  from '../../core/models/abstractStore';
import setPropertyBehavior from '../../../modules/core/models/setPropertyBehavior';
import storeSelectionBehavior from '../../../modules/core/models/storeSelectionBehavior';
import storeParamsBehavior from '../../../modules/core/models/storeParamsBehavior';
import {CardModel} from './cards';

import config from '../../../utils/config';
const {apiPrefix} = config;
const {cardFileUrl} = config[apiPrefix];

const BaseCardFileModel = types
	.model({
		id             : types.identifier(types.number),
		filename       : types.string,
		mimeType       : types.string,
		size           : types.number,
		createdAt      : types.string,
		isSaved        : types.boolean,
		operationsCount: types.number
	});

const CardFileModel = types.compose(
	BaseCardFileModel,
	setPropertyBehavior()
);

export const CardFilesStore = types
	.compose(
		AbstractStore,
		storeSelectionBehavior(),
		storeParamsBehavior({
			params: {
				id: {
					type: 'integer',
					value: 0
				}
			}
		}),
		types
			.model({
				restUrl: cardFileUrl,
				data   : types.optional(types.array(CardFileModel), []),
				card   : types.maybe(types.reference(types.late(() => CardModel)))
			})
	).named("CardFilesStore");
