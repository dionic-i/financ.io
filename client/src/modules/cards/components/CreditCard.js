import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {clone, getSnapshot} from 'mobx-state-tree';
import {VISA} from '../../../modules/core/models/constants';
import {Card, Icon, Checkbox, Tooltip} from 'antd';
import {Link} from 'react-router-dom';
import CreditCardEdit from './CreditCardEdit';

const {Meta} = Card;


class CreditCard extends Component {

	constructor(props) {
		super(props);
		let me = this;

		me.state = {
			isEdit: false,
			clone : null
		};
	}

	render() {
		let me = this;

		return (
			<Card
				style={{width: 350}}
				actions={me.getActions()}
			>
				<Meta
					avatar={me.getCardIcon()}
					title={me.getTitle()}
					description={'Остаток: ' + me.props.item.total}
				/>
			</Card>
		);
	}

	getCardIcon() {
		const iconType = this.props.item.type === VISA ? 'idcard' : 'credit-card';
		return <Icon type={iconType}/>;
	}

	getTitle() {
		let me = this,
			content;

		content = me.state.isEdit
			? (<CreditCardEdit
				item={me.state.clone}
				onChangeName={me.onChangeName}
				onChangeType={me.onChangeType}
			/>)
			: (<Link to={'card/' + me.props.item.id}>{me.props.item.name}</Link>);

		return content;
	}

	getActions() {
		let me = this,
			actions = [];

		actions.push(<Checkbox
			defaultChecked={me.props.isChecked}
			onClick={me.doSelectCard}/>
		);

		if (me.state.isEdit) {

			const saveAction = (
				<Tooltip placement="top" title="Сохранить" overlay="">
					<Icon type="save" onClick={me.doSave}/>
				</Tooltip>
			);

			const cancelAction = (
				<Tooltip placement="top" title="Отменить" overlay="">
					<Icon type="close-circle-o" onClick={me.doCancel}/>
				</Tooltip>
			);

			actions.push(saveAction);
			actions.push(cancelAction);
		}
		else {

			const editAction = (
				<Tooltip placement="top" title="Редактировать" overlay="">
					<Icon type="edit" onClick={me.doEdit}/>
				</Tooltip>
			);

			const removeAction = (
				<Tooltip placement="top" title="Удалить" overlay="">
					<Icon type="delete" onClick={me.doRemove}/>
				</Tooltip>
			);

			actions.push(editAction);
			actions.push(removeAction);
		}

		return actions;
	}

	doEdit = (e) => {
		let me = this;
		e.preventDefault();
		me.setState({isEdit: true, clone: clone(me.props.item)});
	};

	doSave = (e) => {
		let me = this;
		e.preventDefault();
		if (me.props.onSave) {
			const clone = getSnapshot(me.state.clone);
			me.props.onSave(me.props.item, clone);
		}
		me.setState({isEdit: false, clone: null});
	};

	doCancel = (e) => {
		let me = this;
		e.preventDefault();
		me.setState({isEdit: false, clone: null});
	};

	doRemove = (e) => {
		let me = this;
		e.preventDefault();
		if (me.props.onRemove) {
			me.props.onRemove(me.props.item);
		}
	};

	doSelectCard = (value) => {
		let me = this;
		if (me.props.onSelect) {
			me.props.onSelect(me.props.item, value);
		}
	};

	onChangeName = (e) => {
		let me = this;
		const reClone = clone(me.state.clone);
		reClone.setProperty('name', e.target.value);
		me.setState({clone: reClone});
	};

	onChangeType = (value) => {
		let me = this;
		const reClone = clone(me.state.clone);
		reClone.setProperty('type', value);
		me.setState({clone: reClone});
	}

}

CreditCard.defaultProps = {
	isChecked: false
};

CreditCard.propTypes = {
	item     : PropTypes.shape({
		name : PropTypes.string.isRequired,
		desc : PropTypes.string.isRequired,
		type : PropTypes.number.isRequired,
		total: PropTypes.number.isRequired,
	}).isRequired,
	isChecked: PropTypes.bool.isRequired,
	onSelect : PropTypes.func,
	onSave   : PropTypes.func,
	onRemove : PropTypes.func
};

export default CreditCard;
