/**
 * Description of user.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.04.18 12:24
 */
import {types, applySnapshot} from "mobx-state-tree"
import {UserProfileModel, initialUserProfile} from './profile';

export const initialUser = {
	id         : 0,
	username   : '',
	email      : '',
	permissions: [],
	role       : '',
	createdAt  : '',
	profile    : initialUserProfile
};

export const UserModel = types
	.model({
		id         : 0,
		email      : '',
		role       : '',
		permissions: types.optional(types.array(types.string), []),
		createdAt  : '',
		profile    : types.optional(UserProfileModel, {}),
	})
	.actions(self => ({
		forgetUser() {
			applySnapshot(self, initialUser);
		},

		setUser(user) {
			applySnapshot(self, user);
		}
	}));
