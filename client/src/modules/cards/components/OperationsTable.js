/**
 * Description of OperationsTable.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 23.05.18 14:40
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {clone} from 'mobx-state-tree';
import {Button, Table, Divider, Menu, Dropdown, Icon, Popconfirm, Tooltip} from 'antd';
import moment from 'moment';

import OperationForm from './OperationForm';
import BaseModalWindow from '../../core/components/BaseModalWindow';
import {collectionRenderer, dateRenderer, moneyRenderer} from '../../../utils/columnRenderers';
import {INCOME, DEFAULT_DATE_FORMAT, OperationTypeNames} from '../../core/models/constants';
import PeriodSelection from '../../core/components/PeriodSelection';
import CategoriesChoiceForm from '../../categories/components/CategoriesChoiceForm';
import PatternCopyForm from '../../categories/components/PatternCopyForm';


@observer
class OperationsTable extends Component {

	constructor(props) {
		super(props);
		let me = this;

		me.state = {
			isModalVisible              : false,
			isModalForPatternVisible    : false,
			isModalForTransactionVisible: false,
			modalTitle                  : '',
			record                      : null,
			selection                   : '',
			pagination                  : {}
		};
	}

	componentDidMount() {
		this.loadOperations();
	}

	componentDidUpdate(prevProps) {
		let me = this;
		const {card} = me.props;
		if (card !== prevProps.card) {
			this.loadOperations();
		}
	}

	render() {
		let me = this;

		const {operations} = me.props;

		return (
			<div>
				{me.getToolbar()}

				<Table
					rowKey="id"
					bordered={true}
					columns={me.getColumns()}
					dataSource={operations.data.toJS()}
					loading={operations.isLoading}
					pagination={me.state.pagination}
				/>

				{me.getOperationEditWindow()}
				{me.getAddPatternWindow()}
				{me.getSetCategoryWindow()}
			</div>
		);
	}

	getToolbar() {
		let me = this;

		const {operations} = me.props;

		const {start, end} = operations.getParams();

		return (
			<div style={{marginBottom: 5}}>
				<Tooltip title="Добавить операцию" overlay="">
					<Button
						style={{marginRight: 5}}
						type="normal"
						icon="file-add"
						onClick={me.showAddWindow}>
					</Button>
				</Tooltip>
				<Popconfirm title="Вы уверены, что хотите удалить все транзакции за текущий период?"
				            onConfirm={me.removeAll}
				            okText="Да"
				            cancelText="Нет">
					<Tooltip title="Удалить все" overlay="">
						<Button
							style={{marginRight: 5}}
							type="danger"
							icon="delete"
						/>
					</Tooltip>
				</Popconfirm>
				<Tooltip title="Синхронизировать категории" overlay="">
					<Button
						style={{marginRight: 5}}
						type="normal"
						icon="sync"
						onClick={me.syncTransactionCategories}>
					</Button>
				</Tooltip>
				<Divider type="vertical"/>

				<PeriodSelection
					startDate={moment(start)}
					endDate={moment(end)}
					onSelect={operations.changePeriod}
				    quickProps={{
				    	onNext: operations.nextPeriod,
					    onPrev: operations.prevPeriod,
				    	onCurrent: operations.currentPeriod,
				    }}
				/>

				<Tooltip title="Обновить" overlay="">
					<Button
						style={{float: 'right'}}
						type="normal"
						icon="reload"
						onClick={me.refresh}>
					</Button>
				</Tooltip>

				<Tooltip title="Вкл./Откл. пагинацию" overlay="">
					<Button
						style={{float: 'right', marginRight: 5}}
						type="normal"
						icon="ellipsis"
						onClick={me.togglePagination}>
					</Button>
				</Tooltip>
			</div>
		)
	}

	getColumns() {
		let me = this;

		const moneyRender = moneyRenderer();

		return [
			{
				title    : 'Ид',
				dataIndex: 'id',
				align    : 'center',
				width    : 60
			}, {
				title    : 'Описание',
				dataIndex: 'full',
				render   : (text, record) => {
					const actions = (
						<Menu style={{width: 160}}>
							<Menu.Item>
								<a role="button" onClick={e => me.showSavePatternWindow(e, record)}>
									<strong>Сохранить шаблон</strong>
								</a>
							</Menu.Item>
						</Menu>
					);

					return (
						<Dropdown overlay={actions} trigger={['contextMenu']} style={{width: 160}}>
							<span>
								{record.full}
							</span>
						</Dropdown>
					)
				}
			}, {
				title    : 'Дата операции',
				dataIndex: 'iddate',
				align    : 'center',
				width    : 100,
				render   : dateRenderer({recordField: 'iddate', format: 'YYYY-MM-DD'})
			}, {
				title    : 'Тип операции',
				dataIndex: 'type',
				align    : 'center',
				width    : 100,
				render   : collectionRenderer(OperationTypeNames, {recordIdField: 'type'})
			}, {
				title    : 'Сумма, руб.',
				dataIndex: 'amount',
				align    : 'center',
				width    : 100,
				render   : (text, record) => {
					const value = moneyRender(text, record);
					return record.type === INCOME ? (<strong>{value}</strong>) : value;
				}
			}, {
				title    : 'Категория',
				dataIndex: 'category',
				align    : 'center',
				width    : 120,
				render   : (text, record) => {
					return record.category ? record.category.name : '';
				}
			}, {
				title : 'Действия',
				width : 80,
				key   : 'action',
				align : 'center',
				render: (text, record) => {
					const actions = (
						<Menu>
							<Menu.Item>
								<a role="button" onClick={e => me.showAddWindow(e, record)}>Редактировать</a>
							</Menu.Item>
							<Menu.Item>
								<a role="button" onClick={e => me.setCategory(e, record)}>Установить категорию</a>
							</Menu.Item>
							<Menu.Item>
								<a role="button" onClick={e => me.resetCategory(e, record)}>Сбросить категорию</a>
							</Menu.Item>
							<Menu.Item>
								<a role="button" onClick={e => me.remove(e, record)}>Удалить</a>
							</Menu.Item>
						</Menu>
					);

					return (
						<Dropdown overlay={actions}>
							<a className="ant-dropdown-link">
								<Icon type="down"/>
							</a>
						</Dropdown>
					)
				},
			}];
	}

	getOperationEditWindow() {
		let me = this;
		return (
			<BaseModalWindow
				title={me.state.modalTitle}
				isVisible={me.state.isModalVisible}
				onCancel={me.closeModal}
				onSave={me.saveOperation}
			>
				{me.state.isModalVisible &&
				<OperationForm
					record={me.state.record}
				/>
				}
			</BaseModalWindow>
		)
	}

	getAddPatternWindow() {
		let me = this;
		const {categories} = me.props;
		return (
			<BaseModalWindow
				title="Добавление нового шаблона"
				isVisible={me.state.isModalForPatternVisible}
				onCancel={me.closeModal}
				onSave={me.addPattern}
			>
				{me.state.isModalForPatternVisible &&
				<PatternCopyForm
					categories={categories.data.toJS()}
					selection={me.state.selection}
				/>
				}
			</BaseModalWindow>
		)
	}

	getSetCategoryWindow() {
		let me = this;
		const {categories} = me.props;
		return (
			<BaseModalWindow
				title="Установка категории для операции"
				isVisible={me.state.isModalForTransactionVisible}
				onCancel={me.closeModal}
				onSave={me.saveCategoryForTransaction}
			>
				{me.state.isModalForTransactionVisible &&
				<CategoriesChoiceForm
					categories={categories.data.toJS()}
				/>
				}
			</BaseModalWindow>
		)
	}

	loadOperations(reload = true) {
		let me = this;
		const {operations, card} = me.props;
		operations.setParam('card_id', card);
		operations.load(reload);
	}

	onSelect = (selectedRowKeys, selectedRows) => {
		let me = this;
		me.props.operations.select(selectedRows);
		me.forceUpdate();
	};

	remove = (e, record) => {
		let me = this;
		const {operations} = me.props;

		if (e) {
			e.preventDefault();
		}

		operations.remove(record);
	};

	removeAll = () => {
		let me = this;
		const {operations} = me.props;
		const {data} = operations;
		if (data.length > 0) {
			const {start, end, card_id} = operations.getParams();
			operations.removeRange({
				card : card_id,
				start,
				end
			});
		}
	};

	setCategory = (e, record) => {
		let me = this;
		e.preventDefault();
		me.setState({
			isModalForTransactionVisible: true,
			record                      : clone(record)
		});
	};

	saveCategoryForTransaction = (values) => {
		let me = this;

		const {operations, card} = me.props;
		values.card = card;

		// Set 0 for category if you reset it. It depends on backed rules.
		if (!values.category) {
			values.category = 0;
		}

		if (me.state.record) {
			const item = operations.find(me.state.record);
			if (item) {
				operations.update(item, values).then(() => {
					me.closeModal();
				});
			}
		}
	};

	resetCategory = (e, record) => {
		let me = this;
		e.preventDefault();
		if (record) {
			const {operations, card} = me.props;
			operations.update(record, {
				card    : card,
				category: 0
			});
		}
	};

	addPattern = (values) => {
		let me = this;
		const {patterns, operations} = me.props;
		if (me.state.record) {
			const item = operations.find(me.state.record);
			values.oper = item.id;
			patterns.addToCategory(values, item).then(() => {
				me.closeModal();
			});
		}
	};

	syncTransactionCategories = () => {
		this.props.operations.sync();
	};

	refresh = () => {
		this.loadOperations();
	};

	showAddWindow = (e, record = null) => {
		let me = this;

		if (e) {
			e.preventDefault();
		}

		if (!record) {
			me.setState({
				isModalVisible: true,
				modalTitle    : 'Добавление операции',
				record        : null
			});
		} else {
			me.setState({
				isModalVisible: true,
				modalTitle    : 'Редактирование операции: ' + record.id,
				record        : clone(record)
			});
		}
	};

	showSavePatternWindow = (e, record) => {
		let me = this;
		e.preventDefault();
		const selection = window.getSelection().toString();
		me.setState({
			selection,
			record                  : clone(record),
			isModalForPatternVisible: true,
		})
	};

	saveOperation = (values) => {
		let me = this;
		const {operations, card} = me.props;

		// Change some values
		values.card = card;
		if (values.iddate && moment.isMoment(values.iddate)) {
			values.iddate = values.iddate.format(DEFAULT_DATE_FORMAT);
		}

		if (me.state.record) {
			const item = operations.find(me.state.record);
			if (item) {
				operations.update(item, values).then(() => {
					me.closeModal();
				});
			}
		} else {
			operations.create(values).then(() => {
				me.closeModal();
			});
		}
	};

	closeModal = () => {
		this.setState({
			isModalVisible              : false,
			isModalForPatternVisible    : false,
			isModalForTransactionVisible: false,
			modalTitle                  : '',
			record                      : null
		});
	};

	changePeriod = (dates) => {
		this.props.operations.changePeriod(dates);
	};

	togglePagination = () => {
		let me = this;
		const {pagination} = me.state;
		if (!pagination) {
			me.setState({
				pagination: {
					pageSize       : 10,
					showQuickJumper: true,
					showSizeChanger: true
				}
			});
		} else {
			me.setState({pagination: false});
		}
	}

}

OperationsTable.propTypes = {
	operations: PropTypes.object.isRequired,
	card      : PropTypes.number.isRequired,
	categories: PropTypes.object,
	patterns  : PropTypes.object,
};

export default OperationsTable;
