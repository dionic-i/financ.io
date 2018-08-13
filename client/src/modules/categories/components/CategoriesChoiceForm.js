/**
 * Description of CategoriesChoiceForm.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 25.06.18 13:10
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Form} from 'antd';
import CategorySelect from './CategorySelect';


class CategoriesChoiceForm extends Component {

	render() {
		let me = this;

		const {categories} = me.props;

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
					selectOptions={{
						defaultActiveFirstOption: false,
						allowClear              : true
					}}
				    required={false}
				/>
			</Form>
		);
	}
}

CategoriesChoiceForm.propTypes = {
	categories: PropTypes.object.isRequired
};

export default Form.create()(CategoriesChoiceForm);
