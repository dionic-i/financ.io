/**
 * Description of CategoriesTable.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 23.05.18 14:40
 */
import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {clone} from 'mobx-state-tree';
import PropTypes from 'prop-types';
import {Button, Table, Tooltip} from 'antd';

import BaseModalWindow from '../../core/components/BaseModalWindow';
import CategoryForm from './CategoryForm';


@observer
class CategoriesTable extends Component {

	constructor(props) {
		super(props);
		let me = this;
		me.state = {
			isModalVisible: false,
			modalTitle    : '',
			record        : null
		};
	}

	render() {
		let me = this;

		const {categories} = me.props;
		const selectedRowKeys = categories.getSelection(true);

		const rowSelection = {
			selectedRowKeys,
			onChange   : me.onSelectCategory,
			type       : 'radio',
			columnWidth: 16
		};

		return (
			<div>
				{me.getToolbar()}

				<Table
					rowKey="id"
					bordered={true}
					columns={me.getColumns()}
					dataSource={categories.data.toJS()}
					loading={categories.isLoading}
					rowSelection={rowSelection}
				/>

				<BaseModalWindow
					title={me.state.modalTitle}
					isVisible={me.state.isModalVisible}
					onCancel={me.closeModal}
					onSave={me.saveCategory}
				>
					{me.state.isModalVisible &&
					<CategoryForm
						record={me.state.record}
					/>
					}
				</BaseModalWindow>

			</div>
		);
	}

	getColumns() {
		let me = this;

		return [
			{
				title    : 'Ид',
				dataIndex: 'id',
				align    : 'center',
				width    : 80
			},
			{
				title    : 'Название',
				dataIndex: 'name'
			}, {
				title    : 'Действия',
				dataIndex: 'actions',
				width    : 100,
				align    : 'center',
				render   : (text, record) => {
					return (
						<div>
							<Button
								style={{marginRight: 5}}
								size="small"
								type="normal"
								icon="edit"
								onClick={e => me.showAddWindow(e, record)}>
							</Button>
							<Button
								size="small"
								type="danger"
								icon="delete"
								onClick={_ => me.removeCategory(record)}>
							</Button>
						</div>
					)
				}
			}];
	}

	getToolbar() {
		let me = this;



		return (
			<div style={{marginBottom: 5}}>
				<Tooltip title="Добавить категорию" overlay="">
					<Button
						type="normal"
						icon="file-add"
						onClick={me.showAddWindow}>
					</Button>
				</Tooltip>
				<Tooltip title="Обновить" overlay="">
					<Button
						style={{float: 'right'}}
						icon="reload"
						onClick={me.refresh}>
					</Button>
				</Tooltip>
			</div>
		);
	}

	onSelectCategory = (selectedRowKeys, selectedRows) => {
		let me = this;
		const {categories} = me.props;
		categories.select(selectedRows);
		me.forceUpdate();
		if (me.props.onSelect) {
			me.props.onSelect(selectedRowKeys, selectedRows);
		}
	};

	showAddWindow = (e, record) => {
		let me = this;

		e.preventDefault();

		if (!record) {
			me.setState({
				isModalVisible: true,
				modalTitle    : 'Добавление категории'
			});
		} else {
			me.setState({
				isModalVisible: true,
				modalTitle    : 'Редактирование категории',
				record        : clone(record)
			});
		}
	};

	saveCategory = (values) => {
		let me = this;
		const {categories} = me.props;

		if (me.state.record) {
			const item = me.props.categories.find(me.state.record);
			categories.update(item, values).then(() => {
				me.closeModal();
			});
		} else {
			categories.create(values).then(() => {
				me.closeModal();
			});
		}
	};

	removeCategory = (record) => {
		this.props.categories.remove(record);
	};

	refresh = () => {
		this.props.categories.load();
	};

	closeModal = () => {
		this.setState({
			isModalVisible: false,
			modalTitle    : '',
			record        : null
		});
	};

}

CategoriesTable.propTypes = {
	categories : PropTypes.object.isRequired,
	onSelect   : PropTypes.func,
	selectCount: PropTypes.number,
};

export default CategoriesTable;
