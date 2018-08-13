/**
 * Description of setPropertyBehavior.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.05.18 16:40
 */
import {types} from 'mobx-state-tree';

function setPropertyBehavior(config = {}) {

	/**
	 * In next version we can create some options and use them.
	 */

	return types
		.model({}).actions(self => {

			const setProperties = function (attrs, silent = false) {
				for (let prop in attrs) {
					if (attrs.hasOwnProperty(prop)) {
						self.setProperty(prop, attrs[prop], silent);
					}
				}
			};

			const setProperty = function (name, value, silent = false) {
				const action = 'set' + name.charAt(0).toUpperCase() + name.substr(1);
				if (self.hasOwnProperty(action)) {
					self[action](value);
				}
				else if (self.hasOwnProperty(name)) {
					self[name] = value;
				} else if (!silent) {
					throw new Error(`Error to find ${name} property.`)
				}
			};

			return {
				setProperties,
				setProperty
			}
		});
}

export default setPropertyBehavior;
