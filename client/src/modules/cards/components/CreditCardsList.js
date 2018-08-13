import React, {Component} from 'react';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import {List, Button, Tooltip} from 'antd';
import CreditCard from './CreditCard';
import BaseModalWindow from '../../core/components/BaseModalWindow';
import CreditCardForm from './CreditCardForm';


@observer
class CreditCardsList extends Component {

	constructor(props) {
		super(props);
		let me = this;
		me.state = {
			showAdd: false
		}
	}

	render() {
		let me = this;

		const {cards} = me.props;

		return (
			<div>

				{me.getToolbar()}

				<List
					grid={{gutter: 16, column: 1}}
					dataSource={cards.data.toJS()}
					renderItem={me.renderItem}
					loading={cards.isLoading}
				/>

				<BaseModalWindow
					title="Добавление кредитной карты"
					isVisible={me.state.showAdd}
					onSave={me.createCard}
					onCancel={me.closeModal}
				>
					{me.state.showAdd &&
					<CreditCardForm
						record={me.state.record}
					/>}
				</BaseModalWindow>

			</div>
		);
	}

	getToolbar() {
		let me = this;
		return (
			<div>
				<Tooltip title="Добавить карту" overlay="">
					<Button
						style={{marginBottom: 5, marginRight: 5}}
						type="primary"
						icon="file-add"
						onClick={me.showAddWindow}
					/>
				</Tooltip>

				<Tooltip title="Обновить" overlay="">
					<Button
						style={{marginBottom: 5}}
						type="normal"
						icon="reload"
						onClick={me.refresh}
					/>
				</Tooltip>
			</div>
		)
	}

	renderItem = (item) => {
		let me = this;

		const {selection} = me.props;
		const checked = selection.indexOf(item.id) !== -1;
		const key = 'ItemKey' + item.id + '_' + checked;

		return (
			<List.Item key={key}>
				<CreditCard
					item={item}
					isChecked={checked}
					onSelect={me.selectCard}
					onSave={me.saveCard}
					onRemove={me.removeCard}
				/>
			</List.Item>
		);
	};

	selectCard = (item, value) => {
		let me = this;
		if (me.props.onSelectCard) {
			const {cards} = me.props;

			if (value.target.checked) {
				cards.select([item]);
			} else {
				cards.deselect([item]);
			}

			me.props.onSelectCard(item, value.target.checked)
		}
	};

	saveCard = (item, values) => {
		this.props.cards.update(item, values);
	};

	removeCard = (item) => {
		this.props.cards.remove(item);
	};

	createCard = (values) => {
		let me = this;
		me.props.cards.create(values).then(() => {
			me.closeModal();
		});
	};

	showAddWindow = () => {
		this.setState({showAdd: true});
	};

	closeModal = () => {
		this.setState({showAdd: false});
	};

	refresh = () => {
		this.props.cards.load();
	};

}

CreditCardsList.defaultProps = {
	onSelectCard: () => {
	}
};

CreditCardsList.propTypes = {
	cards       : PropTypes.object.isRequired,
	selection   : PropTypes.array.isRequired,
	onSelectCard: PropTypes.func,
};

export default CreditCardsList;
