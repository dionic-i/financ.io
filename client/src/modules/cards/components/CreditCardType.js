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
import {VISA, MASTERCARD} from '../../../modules/core/models/constants';
import Rules from '../../../utils/fieldRules';

const Option = Select.Option;
const FormItem = Form.Item;
const {requiredRule} = Rules;

class CreditCardType extends React.Component {

	render() {
		let me = this;
		return (me.props.form ? me.renderToForm() : me.renderSelect());
	}

	renderToForm() {
		let me = this;
		const {name, label, layout, form} = me.props;
		const itemStyle = me.props.style || {};
		const initialValue = me.props.type || MASTERCARD;

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
					<Select>
						<Option value={MASTERCARD}>Mastercard</Option>
						<Option value={VISA}>Visa</Option>
					</Select>
				)}
			</FormItem>
		)
	}

	renderSelect() {
		const {type, onSelect} = this.props;
		return (
			<Select defaultValue={type} onSelect={value => onSelect(value)}>
				<Option value={MASTERCARD}>Mastercard</Option>
				<Option value={VISA}>Visa</Option>
			</Select>
		);
	}

}

CreditCardType.propTypes = {
	type    : PropTypes.number,
	onSelect: PropTypes.func,
	name    : PropTypes.string,
	label   : PropTypes.string,
	form    : PropTypes.object,
	layout  : PropTypes.object
};

CreditCardType.defaultProps = {
	name    : 'type',
	label   : 'Тип карты',
	form    : null,
	layout  : {},
	type    : MASTERCARD,
	onSelect: () => {
	}
};

export default CreditCardType;
