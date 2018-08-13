/**
 * Description of ui-single-card.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 08.05.18 13:40
 */
import {types, flow, getRoot, applySnapshot} from 'mobx-state-tree';
import {fetchData, saveData} from '../../core/services/commonService';
import setPropertyBehavior from '../../../modules/core/models/setPropertyBehavior';
import {GhostTransactionStore} from './transactions';
import {CardFilesStore} from './card-files';
import {OperationStore} from './operations';
import {CardModel} from './cards';
import config from '../../../utils/config';

const {apiPrefix} = config;
const {cardRestUrl} = config[apiPrefix];

const initialState = {
	card             : null,
	prevCardId       : -1,
	nextCardId       : -1,
	ghostTransactions: {},
	cardFiles        : {},
	operations       : {},
	isLoading        : false
};

export const uiSingleCard = types.compose(
	setPropertyBehavior(),
	types.model({
		title            : 'Страница банковской карты',
		card             : types.maybe(types.late(() => CardModel)),
		prevCardId       : types.optional(types.number, -1),
		nextCardId       : types.optional(types.number, -1),
		ghostTransactions: types.optional(GhostTransactionStore, {}),
		cardFiles        : types.optional(CardFilesStore, {}),
		operations       : types.optional(OperationStore, {}),
		isLoading        : false
	})
		.actions(self => {

			const setInitialState = () => {
				applySnapshot(self, initialState);
			};

			const setUploadTransactions = (response) => {
				self.isLoading = false;
				const {item} = response;
				self.cardFiles.addRecord(item);
			};

			const loadCard = flow(function* load(id) {
				const url = cardRestUrl.replace(':id', id);
				try {
					self.isLoading = true;
					const {success, item, next, prev} = yield fetchData(url, {});
					if (success) {
						self.card = item;
						self.nextCardId = next;
						self.prevCardId = prev;
						self.isLoading = false;
					} else {
						self.isLoading = false;
					}
				} catch (err) {
					self.isLoading = false;
				}
			});

			const saveCard = flow(function* save(data) {
				const url = cardRestUrl.replace(':id', self.card.id);
				try {
					self.isLoading = true;
					const {success} = yield saveData(url, 'POST', data);
					if (success) {
						self.card.setProperties(data);
						self.isLoading = false;
						getRoot(self).message('Изменения успешно сохранены.');
					} else {
						self.isLoading = false;
					}
				} catch (err) {
					self.isLoading = false;
				}
			});

			const addUploadFile = (file) => {
				self.isLoading = false;
				self.cardFiles.addRecord(file);
			};

			const nextCard = (history) => {
				if (self.nextCardId !== -1) {
					const id = self.nextCardId;
					self.loadCard(id).then(() => {
						history.push(`${id}`);
					});
				}
			};

			const prevCard = (history) => {
				if (self.prevCardId !== -1) {
					const id = self.prevCardId;
					self.loadCard(id).then(() => {
						history.push(`${id}`);
					});
				}
			};

			return {
				loadCard,
				saveCard,
				addUploadFile,
				setUploadTransactions,
				prevCard,
				nextCard,
				setInitialState
			}
		})).views(self => ({

		get hasNext() {
			return self.nextCardId !== -1;
		},

		get hasPrev() {
			return self.prevCardId !== -1;
		}

	})
).named("uiSingleCard");
