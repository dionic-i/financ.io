import React from 'react';
import PropTypes from 'prop-types';
import {Input} from 'antd';
import CreditCardType from './CreditCardType';

const InputGroup = Input.Group;

function CreditCardEdit({item, onChangeType, onChangeName}) {

	const acOnChangeType = function (value) {
		onChangeType(value);
	};

	const acChangeName = function (e) {
		onChangeName(e);
	};

	return (
		<div>
			<InputGroup compact>
				<CreditCardType type={item.type} onSelect={acOnChangeType}/>
				<Input style={{width: '50%'}} defaultValue={item.name} onChange={acChangeName}/>
			</InputGroup>
		</div>
	);
}

CreditCardEdit.propTypes = {
	item        : PropTypes.shape({
		name : PropTypes.string.isRequired,
		desc : PropTypes.string.isRequired,
		type : PropTypes.number.isRequired,
		total: PropTypes.number.isRequired,
	}).isRequired,
	onChangeType: PropTypes.func.isRequired,
	onChangeName: PropTypes.func.isRequired
};

export default CreditCardEdit;
