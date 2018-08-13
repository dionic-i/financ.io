/**
 * Description of EntitiesChoiceButton.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.07.18 8:09
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Tooltip, Modal} from 'antd';
import CheckableTags from './CheckableTags';

class EntitiesChoiceButton extends Component {

	static getDerivedStateFromProps(props, state) {
		const selection = (props.selection.length !== state.selection.length)
			? [...props.selection]
			: [...state.selection];

		return {
			...state,
			selection
		}
	}

	constructor(props) {
		super(props);
		let me = this;
		me.state = {
			isModalVisible: false,
			selection     : me.props.selection
		};
	}

	render() {
		let me = this;

		const {
			tooltip,
			selection,
			buttonProps = {
				type: 'normal',
				icon: 'setting'
			}
		} = me.props;

		return (
			<div style={{display: 'inline-block', float: 'right', marginRight: 5}}>
				<Tooltip title={tooltip} overlay="">
					<Button {...buttonProps} onClick={me.acShowModal}>
						Выбрано: {selection.length}
					</Button>
				</Tooltip>
				{me.getModalWindow()}
			</div>
		);
	}

	getModalWindow() {
		let me = this;

		const {entities, tooltip} = me.props;
		const {selection} = me.state;

		return (
			<Modal
				title={(<div>{tooltip} ({selection.length})</div>)}
				visible={me.state.isModalVisible}
				wrapClassName="vertical-center-modal"
				closable={false}
				onCancel={me.acCloseModal}
				onOk={me.acSelectEntities}
			>
				<CheckableTags
					tags={entities}
					selection={selection}
					exclude={false}
					onCheck={me.acCheckEntity}
				/>
			</Modal>
		);
	}

	acShowModal = () => {
		this.setState({isModalVisible: true});
	};

	acCloseModal = () => {
		this.setState({isModalVisible: false});
	};

	acSelectEntities = () => {
		let me = this;
		me.setState({isModalVisible: false});
		me.props.onSelect(me.state.selection);
	};

	acCheckEntity = (item, checked) => {
		let me = this;
		const {selection} = me.state;
		const choice = checked ? [...selection, item.id] : selection.filter(r => r !== item.id);
		me.setState({selection: choice});
	};

}

EntitiesChoiceButton.propTypes = {
	tooltip    : PropTypes.string.isRequired,
	entities   : PropTypes.arrayOf(PropTypes.shape({
		id  : PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
	})).isRequired,
	selection  : PropTypes.array.isRequired,
	onSelect   : PropTypes.func.isRequired,
	buttonProps: PropTypes.shape({
		type: PropTypes.string,
		icon: PropTypes.string
	}),
	buttonStyle: PropTypes.object
};

export default EntitiesChoiceButton;
