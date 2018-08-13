/**
 * Description of OperationForm.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.05.18 20:26
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Form, Input, InputNumber, DatePicker} from 'antd';
import OperationTypeSelect from './OperationTypeSelect';
import moment from 'moment';

import {OUTCOME} from '../../core/models/constants';
import Rules from '../../../utils/fieldRules';

const FormItem = Form.Item;
const {TextArea} = Input;
const {requiredRule, stringRule, numberRule} = Rules;

class OperationForm extends Component {

	render() {
		let me = this;

		const {getFieldDecorator} = me.props.form;

		const itemStyle = {marginBottom: 5};
		const formItemLayout = {
			labelCol  : {
				xs: {span: 24},
				sm: {span: 8},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 16},
			},
		};

		const {
			iddate = moment(),
			full = 'Новая операция',
			amount = 1,
			type = OUTCOME
		} = me.props.record || {};

		const blockType = !!me.props.record;

		return (
			<Form>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Дата операции"
				>
					{getFieldDecorator('iddate', {
						initialValue: moment(iddate),
						rules: [requiredRule],
					})(
						<DatePicker style={{width: '100%'}}/>
					)}
				</FormItem>

				<OperationTypeSelect
					form={me.props.form}
					layout={formItemLayout}
					style={itemStyle}
					type={type}
				    selectOptions={{disabled: blockType}}
				/>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Сумма операции"
				>
					{getFieldDecorator('amount', {
						initialValue: amount,
						rules: [requiredRule, numberRule(1, 1000000)],
					})(
						<InputNumber style={{width: '100%'}} min={1} max={1000000} precision={2} />
					)}
				</FormItem>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Описание операции"
				>
					{getFieldDecorator('full', {
						initialValue: full,
						rules: [requiredRule, stringRule(5, 250)],
					})(
						<TextArea rows={4} />
					)}
				</FormItem>

			</Form>
		);
	}

}

OperationForm.propTypes = {
	record: PropTypes.object
};

export default Form.create()(OperationForm);
