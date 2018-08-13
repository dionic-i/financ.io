/**
 * Description of renderers.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 23.03.18 17:37
 */
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import {Button} from 'antd';

const ButtonGroup = Button.Group;

/**
 *
 * @param collection
 * @param options
 * @returns {function(*, *, *)}
 */
function collectionRenderer(collection, options = {}) {

	if (!_.isArray(collection)) {
		throw new Error('Collection must be an Array!')
	}

	const fields = _.defaults(options, {
		itemIdField     : 'id',
		itemDisplayField: 'desc',
		recordIdField   : 'id',
		defaultValue    : 'No value'
	});

	const {itemIdField, itemDisplayField, recordIdField, defaultValue} = fields;

	return (text, record, index) => {
		let result = defaultValue;

		for (let item of collection) {
			if (record[recordIdField] === item[itemIdField]) {
				result = item[itemDisplayField];
				break;
			}
		}

		return result;
	}
}

/**
 * Render function for
 * @param options
 * @returns {function(*, *, *)}
 */
function dateRenderer(options) {
	const config = _.defaults(options, {
		format     : 'YYYY-MM-DD',
		recordField: 'iddate'
	});
	const {format, recordField} = config;
	return (text, record) => {
		const date = moment(record[recordField]);
		return date.isValid() ? date.format(format) : record[recordField];
	}
}

/**
 * Render function for date fields.
 * @param options
 * @returns {function(*, *, *)}
 */
function yesNoRenderer(options) {
	const config = _.defaults(options, {
		yesValue   : 'Да',
		noValue    : 'Нет',
		recordField: 'id'
	});
	const {yesValue, noValue, recordField} = config;
	return (text, record, index) => {
		return record[recordField] ? yesValue : noValue;
	}
}

/**
 * Render function for date fields.
 * @param options
 * @returns {function(*, *, *)}
 */
function moneyRenderer(options) {
	const config = _.defaults(options, {
		recordField: 'amount'
	});
	const {recordField} = config;
	return (text, record, index) => {
		const value = parseFloat(record[recordField]);
		return value ? value.toFixed(2) : record[recordField];
	}
}

/**
 *
 * @param options [{
 *  icon: '',
 *  handler: func,
 *
 * }]
 * @returns {function(*, *, *)}
 */

function actionColumnRenderer(options) {
	return (text, record, index) => {

		let items = '';

		if (options.length > 0) {
			items = options.map((item, index) => {
				return (
					<Button key={index} type="primary" icon={item.icon} onClick={_ => item.handler(record, index)}/>);
			})
		}

		return (
			<span>
				<ButtonGroup>
					{items}
				</ButtonGroup>
			</span>
		)
	}
}

export {
	collectionRenderer,
	yesNoRenderer,
	dateRenderer,
	moneyRenderer,
	actionColumnRenderer
}
