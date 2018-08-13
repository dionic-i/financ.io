/**
 * Description of common.
 * Common static params of this project.
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 24.04.18 8:41
 */

export const VISA = 1;
export const MASTERCARD = 2;

export const CardTypeNames = [{
	id  : VISA,
	desc: 'Visa'
}, {
	id  : MASTERCARD,
	desc: 'Mastercard'
}];

export const INCOME = 1;
export const OUTCOME = 0;

export const OperationTypeNames = [{
	id  : INCOME,
	desc: 'Приход'
}, {
	id  : OUTCOME,
	desc: 'Расход'
}];

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
