/**
 * Description of errorStore.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 25.04.18 9:24
 */
import {types} from 'mobx-state-tree';

export const Message = types.model({
	message: types.string,
	type   : types.number
});

export const Notification = types.model({
	title      : types.string,
	description: types.string,
	type       : types.number
});

export const Error = types.model({
	param: types.string,
	msg  : types.string
});

export const ErrorMessage = types.model({
	title: types.string,
	list : types.optional(types.array(Error), [])
});

export const ErrorStore = types.model({
	list: types.optional(types.array(ErrorMessage), [])
});

export const SUCCESS_NOTE = 1;
export const WARNING_NOTE = 2;
export const ERROR_NOTE = 3;
export const INFO_NOTE = 4;
