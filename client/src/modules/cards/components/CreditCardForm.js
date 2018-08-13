/**
 * Description of CreditCardForm.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.05.18 20:26
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Form, Input, InputNumber} from 'antd';
import CreditCardType from './CreditCardType';
import {MASTERCARD} from '../../../modules/core/models/constants';
import Rules from '../../../utils/fieldRules';

const FormItem = Form.Item;
const {requiredRule, stringRule, numberRule} = Rules;

class CreditCardForm extends Component {

	render() {
		let me = this;

		const {getFieldDecorator} = me.props.form;

		const formItemLayout = me.props.layout || {
			labelCol  : {
				xs: {span: 24},
				sm: {span: 8},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 16},
			},
		};

		const itemStyle = {marginBottom: 5};

		const {
			name = 'Новая карта',
			desc = '',
			total = 0,
			type = MASTERCARD,
			opCount = 0
		} = me.props.record || {};

		return (
			<Form>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Название карты"
				>
					{getFieldDecorator('name', {
						initialValue: name,
						rules: [stringRule(5, 100), requiredRule]
					})(
						<Input />
					)}
				</FormItem>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Описание карты"
				>
					{getFieldDecorator('desc', {
						initialValue: desc,
						rules: [stringRule(5, 100), requiredRule]
					})(
						<Input />
					)}
				</FormItem>

				<CreditCardType
					form={me.props.form}
					layout={formItemLayout}
					style={itemStyle}
					type={type}
				/>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Остаток, руб"
				>
					{getFieldDecorator('total', {
						initialValue: total,
						rules: [numberRule(-1000000, 1000000)]
					})(
						<InputNumber style={{width: '100%'}} disabled={opCount !== 0} />
					)}
				</FormItem>
			</Form>
		);
	}

}

CreditCardForm.propTypes = {
	record: PropTypes.object,
	layout: PropTypes.object
};

export default Form.create()(CreditCardForm);
