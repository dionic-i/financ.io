/**
 * Description of GhostTransactionsTable.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 23.05.18 14:40
 */
import React, {Component} from 'react';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import {Button, Table, Icon, Dropdown, Menu, message, Badge} from 'antd';

const SubMenu = Menu.SubMenu;


@observer
class GhostTransactionsTable extends Component {

	componentDidMount() {
		let me = this;
		const {transactions, cardId, file} = me.props;
		if (file) {
			transactions.load(cardId, file.id);
		}
	}

	render() {
		let me = this;

		const {transactions} = me.props;

		const selectedRowKeys = transactions.getSelection(true);
		const rowSelection = {
			selectedRowKeys,
			onChange: me.onSelect,
		};

		return (
			<div>
				{me.getToolbar()}

				<Table
					rowKey="id"
					bordered={true}
					columns={me.getColumns()}
					dataSource={transactions.data.toJS()}
					rowSelection={rowSelection}
					pagination={false}
					scroll={{y: 380}}
					loading={transactions.isLoading}
				/>
			</div>
		);
	}

	getToolbar() {
		let me = this;

		const {transactions, file} = me.props;

		const mr = {marginRight: 2, marginBottom: 2};
		const status = transactions.hasNotSelectedField() ? 'error' : 'success';
		const isSaved = file && file.isSaved;

		return (
			<div style={mr}>

				{!isSaved && (
					<Button
						style={mr}
						type="normal"
						icon="save"
						onClick={me.saveTransactions}>
					</Button>
				)}

				{!isSaved && (
					<Button
						style={mr}
						type="danger"
						icon="delete"
						onClick={me.removeTransactions}>
					</Button>
				)}

				{file && (
					<Button
						style={mr}
						type="normal"
						icon="reload"
						onClick={me.refresh}>
					</Button>
				)}

				{!isSaved && (
					<div style={{float: 'right'}}>
						<Badge style={mr} status={status} text="Статус таблицы"/>
					</div>
				)}

				<div style={{float: 'right'}}>
					{me.getTotalAmount()}
				</div>
			</div>
		)
	}

	getTotalAmount() {
		let me = this;

		const {transactions} = me.props;
		const account = transactions.getTotalAmount();

		const divStyle = {float: 'right', marginRight: 80};
		const props = {
			showZero     : true,
			offset       : [-10, 10],
			overflowCount: 1000000,
		};

		return (
			<div>
				<div style={divStyle}>
					<Badge {...props} count={account.total} style={{backgroundColor: '#137fff'}}>Остаток</Badge>
				</div>
				<div style={divStyle}>
					<Badge {...props} count={account.minus} style={{backgroundColor: '#c40d19'}}>Расход</Badge>
				</div>
				<div style={divStyle}>
					<Badge {...props} count={account.plus} style={{backgroundColor: '#52c41a'}}>Приход</Badge>
				</div>
			</div>
		)
	}

	getColumns() {
		let me = this,
			submenu;

		const {transactions} = me.props;
		const recvColumns = transactions.columns.toJS();


		console.log(transactions.hasNotSelectedField());

		if (transactions.hasNotSelectedField()) {
			const items = transactions.unSelectedFields().map(field => <Menu.Item
				key={field.index}>{field.title}</Menu.Item>);
			submenu = (
				<SubMenu key="type" title={<strong>Установить тип поля</strong>}>
					{items}
				</SubMenu>
			);
		}

		const columns = recvColumns.map((item, index) => {

			const title = item.isCustom
				? (<span style={{color: 'blue', fontWeight: 'bold'}}>{item.title}</span>)
				: item.title;

			const toggleType = item.isCustom
				? (<Menu.Item key="untype"><strong>Снять тип</strong></Menu.Item>)
				: submenu;

			const deleteBtn = !item.isCustom
				? (<Menu.Item key="delete">Удалить колонку</Menu.Item>)
				: '';

			const menu = (
				<Menu onClick={(action) => me.columnAction(action, item)}>
					{toggleType}
					<Menu.Item key="merge">Объединить колонку</Menu.Item>
					{deleteBtn}
				</Menu>
			);

			const nodeTitle = (
				<div>
					{title}
					<Dropdown overlay={menu}>
						<Icon type="down"/>
					</Dropdown>
				</div>
			);

			return {
				title    : nodeTitle,
				dataIndex: item,
				width    : 80,
				render   : (text, record) => {
					const columnRecord = record.record.find(value => value.field === item.dataIndex);
					return columnRecord ? columnRecord.value : text;
				}
			}
		});

		columns.unshift({
			title    : 'Ид',
			dataIndex: 'id',
			align    : 'center',
			width    : 40
		});

		return columns;
	}

	refresh = () => {
		let me = this;
		const {transactions, cardId, file} = me.props;
		transactions.load(cardId, file.id);
	};

	removeTransactions = () => {
		let me = this;
		me.props.transactions.removeTransactions();
		me.forceUpdate();
	};

	saveTransactions = () => {
		let me = this;

		const {transactions, cardId, file} = me.props;

		if (!transactions.hasNotSelectedField()) {
			transactions.save(cardId, file.id).then((data) => {
				if (me.props.onSave) {
					me.props.onSave(data);
				}
			});
		} else {
			message.error('Для сохранения транзакций необходимо указать все обязательные поля.');
		}
	};

	onSelect = (selectedRowKeys, selectedRows) => {
		let me = this;
		me.props.transactions.select(selectedRows);
		me.forceUpdate();
	};

	columnAction = (action, column) => {
		let me = this;

		const {transactions} = me.props;
		const key = action.keyPath.indexOf('type') !== -1 ? 'type' : action.key;

		switch (key) {
			case 'type':
				transactions.setColumnType(action.key, column);
				break;
			case 'untype':
				transactions.resetColumnType(column);
				break;
			case 'merge':
				transactions.mergeColumns(column);
				break;
			case 'delete':
				transactions.removeColumn(column);
				break;
			default:
				throw new Error('Can not find column action by type. GhostTransactionTable');
		}
	};

}

GhostTransactionsTable.propTypes = {
	transactions: PropTypes.shape({
		columns: PropTypes.object,
		data   : PropTypes.object
	}).isRequired,
	file        : PropTypes.object,
	cardId      : PropTypes.number,
	onSave      : PropTypes.func,
};

export default GhostTransactionsTable;
