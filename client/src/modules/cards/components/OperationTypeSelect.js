/**
 * Description of CreditCardType.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.05.18 17:13
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Form, Select} from 'antd';
import {INCOME, OUTCOME} from '../../../modules/core/models/constants';
import Rules from '../../../utils/fieldRules';

const Option = Select.Option;
const FormItem = Form.Item;

const {requiredRule} = Rules;

class OperationTypeSelect extends React.Component {

	render() {
		let me = this;
		return (me.props.form ? me.renderToForm() : me.renderSelect());
	}

	renderToForm() {
		let me = this;
		const {name, label, layout, form} = me.props;
		const itemStyle = me.props.style || {};
		const initialValue = me.props.type || OUTCOME;
		const selectOptions = me.props.selectOptions || {};

		return (
			<FormItem
				style={itemStyle}
				{...layout}
				label={label}
			>
				{form.getFieldDecorator(name, {
					initialValue: initialValue,
					rules       : [requiredRule]
				})(
					<Select {...selectOptions}>
						<Option value={INCOME}>Приход</Option>
						<Option value={OUTCOME}>Расход</Option>
					</Select>
				)}
			</FormItem>
		)
	}

	renderSelect() {
		const {type, onSelect} = this.props;
		return (
			<Select defaultValue={type} onSelect={value => onSelect(value)}>
				<Option value={INCOME}>Приход</Option>
				<Option value={OUTCOME}>Расход</Option>
			</Select>
		);
	}

}

OperationTypeSelect.propTypes = {
	type         : PropTypes.number,
	onSelect     : PropTypes.func,
	name         : PropTypes.string,
	label        : PropTypes.string,
	form         : PropTypes.object,
	layout       : PropTypes.object,
	selectOptions: PropTypes.object,
};

OperationTypeSelect.defaultProps = {
	name    : 'type',
	label   : 'Тип операции',
	form    : null,
	layout  : {},
	type    : OUTCOME,
	onSelect: () => {
	}
};

export default OperationTypeSelect;
