/**
 * Description of CategoriesChoiceCard.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 25.06.18 13:10
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Input, Form} from 'antd';
import Rules from '../../../utils/fieldRules';
import CategorySelect from './CategorySelect';

const {requiredRule, stringRule} = Rules;
const FormItem = Form.Item;


class PatternCopyForm extends Component {

	render() {
		let me = this;

		const {categories, selection, form} = me.props;
		const {getFieldDecorator} = form;

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
				<CategorySelect
					form={me.props.form}
					categories={categories}
					layout={formItemLayout}
				    style={itemStyle}
				/>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Название шаблона"
				>
					{getFieldDecorator('name', {
						initialValue: 'Новый шаблон',
						rules       : [requiredRule, stringRule(3, 100)],
					})(
						<Input />
					)}
				</FormItem>

				<FormItem
					style={itemStyle}
					{...formItemLayout}
					label="Шаблон"
				>
					{getFieldDecorator('search', {
						initialValue: selection,
						rules       : [requiredRule, stringRule(3, 100)],
					})(
						<Input />
					)}
				</FormItem>

			</Form>
		);
	}
}

PatternCopyForm.propTypes = {
	categories: PropTypes.array.isRequired,
	selection : PropTypes.string.isRequired
};

export default Form.create()(PatternCopyForm);
