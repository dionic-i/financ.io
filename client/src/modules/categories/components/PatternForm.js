/**
 * Description of PatternForm.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.05.18 20:26
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Form, Input} from 'antd';
import Rules from '../../../utils/fieldRules';

const FormItem = Form.Item;
const {requiredRule, stringRule} = Rules;

class PatternForm extends Component {

	render() {
		let me = this;

		const {getFieldDecorator} = me.props.form;
		const {record} = me.props;

		const {name = 'Новый шаблон', search = ''} = record || {};

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

		return (
			<Form>
				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Название шаблона"
				>
					{getFieldDecorator('name', {
						initialValue: name,
						rules: [requiredRule, stringRule(3, 100)],
					})(
						<Input />
					)}
				</FormItem>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Шаблон поиска"
				>
					{getFieldDecorator('search', {
						initialValue: search,
						rules: [requiredRule, stringRule(5, 100)],
					})(
						<Input />
					)}
				</FormItem>

			</Form>
		);
	}

}

PatternForm.propTypes = {
	record: PropTypes.object
};

export default Form.create()(PatternForm);
