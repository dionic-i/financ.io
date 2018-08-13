/**
 * Description of menu.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.04.18 9:18
 */
import {types, flow} from "mobx-state-tree";
import {fetchMenuItems} from '../services/appService';

const SubmenuItem = types.model({
	key        : types.identifier(),
	title      : types.string,
	icon       : '',
	route      : types.string,
	permissions: types.string
});

const MenuItem = types
	.model({
		key        : types.identifier(),
		title      : types.string,
		icon       : '',
		route      : types.string,
		right      : types.boolean,
		permissions: types.string,
		isLogoutBtn: false,
		submenu    : types.optional(types.array(SubmenuItem), [])
	});

const initialMenu = [];

export const MenuItems = types
	.model({
		activeMenuKey: types.optional(types.string, 'index'),
		items        : types.optional(types.array(MenuItem), initialMenu)
	})
	.actions(self => {

		function setItems(items) {
			self.items = items;
		}

		function clearItems() {
			self.items = initialMenu;
		}

		const changeLocation = function (key) {
			self.activeMenuKey = key;
		};

		const initLocation = () => {
			const location = window.location;
			const hash = location.hash.slice(1);

			const item = self.items.find(item => {
				let match = false;

				if (item.submenu.length > 0) {
					match = item.submenu.find(subitem => {
						return subitem.route === hash;
					});
				} else {
					match = item.route === hash;
				}

				return match;
			});

			if (item) {
				self.activeMenuKey = item.key;
			}
		};

		const load = flow(function* load() {
			try {
				const {menu} = yield fetchMenuItems();
				setItems(menu);
			} catch (err) {
				console.error("Failed to load items ", err)
			}
		});

		return {
			load,
			changeLocation,
			initLocation,
			clearItems
		}
	})
	.named('MenuItems');
