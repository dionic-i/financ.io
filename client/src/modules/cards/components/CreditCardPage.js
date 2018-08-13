import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {Row, Col, Spin, Button, Icon, Upload, Modal, Tabs, notification, Tooltip} from 'antd';
import {clone} from 'mobx-state-tree';
import config from '../../../utils/config';
import {getUserData} from '../../../utils/helpers';
import CreditCardForm from './CreditCardForm';
import GhostTransactionsTable from './GhostTransactionsTable';
import FilesTable from './FilesTable';
import OperationsTable from './OperationsTable';

const {apiPrefix} = config;
const {cardUploadUrl} = config[apiPrefix];
const TabPane = Tabs.TabPane;
const ButtonGroup = Button.Group;


@observer
class CreditCardPage extends Component {

	constructor(props) {
		super(props);
		let me = this;

		Object.assign(me, {
			acSaveCard               : me.saveCard.bind(me),
			acCloseTransactionsWindow: me.closeGhostTransactionWindow.bind(me),
			acSaveTransactions       : me.saveGhostTransactions.bind(me),
			acChangeCard             : me.changeCard.bind(me),
			acShowFileOperations     : me.showFileOperations.bind(me),
			acNextCard               : me.nextCard.bind(me),
			acPrevCard               : me.prevCard.bind(me)
		});

		me.state = {
			isGhostWindowVisible: false,
			cardTabKey          : 'operations',
			file                : null
		}
	}

	componentDidMount() {
		let me = this;
		const {match} = me.props;
		const {uiSingleCard, uiCategories} = me.props.appStore;
		uiCategories.loadCategories(false);
		uiSingleCard.loadCard(match.params.id);
	}

	render() {
		let me = this;

		const {match} = me.props;
		const {uiSingleCard, uiCategories} = me.props.appStore;
		const {card, isLoading, cardFiles, operations} = uiSingleCard;
		const {categories, patterns} = uiCategories;

		const layout = {
			labelCol  : {
				span: 24
			},
			wrapperCol: {
				span: 24
			},
		};

		const record = card ? clone(card) : null;
		const buttonStyle = {marginTop: 10, width: '100%'};

		const h2Style = {
			display    : 'inline-block',
			marginRight: 30
		};

		const cardId = parseInt(match.params.id, 10);

		return (
			<div>
				<div>
					<h2 style={h2Style}>Банковская карта: {record ? record.name : ''}</h2>
					<ButtonGroup style={{float: 'right'}}>
						<Tooltip placement="top" title="Предыдущая карта" overlay="">
							<Button type="primary" onClick={me.acPrevCard} disabled={!uiSingleCard.hasPrev}>
								<Icon type="left"/>
							</Button>
						</Tooltip>
						<Tooltip placement="top" title="Следующая карта" overlay="">
							<Button type="primary" onClick={me.acNextCard} disabled={!uiSingleCard.hasNext}>
								<Icon type="right"/>
							</Button>
						</Tooltip>
					</ButtonGroup>
				</div>

				<Row gutter={16}>
					<Col span={4}>
						<h3>Реквизиты карты</h3>
						<Spin tip="Загрузка..." spinning={isLoading}>

							<CreditCardForm
								layout={layout}
								record={record}
								ref={(formRef) => {
									me.formRef = formRef
								}}
							/>

							<div id="card-upload">
								<Button style={buttonStyle} type="primary" onClick={me.acSaveCard}>
									<Icon type="save"/>Сохранить изменения
								</Button>
								{me.renderUploadButton()}
							</div>
						</Spin>
					</Col>

					<Col span={20}>
						<Tabs activeKey={me.state.cardTabKey}
						      onChange={me.acChangeCard}
						>
							<TabPane tab="Операции" key="operations">
								<OperationsTable
									operations={operations}
									categories={categories}
									patterns={patterns}
									card={cardId}
								/>
							</TabPane>
							<TabPane tab="Загрузки" key="files">
								<FilesTable
									cardFiles={cardFiles}
									card={cardId}
									onShowOperations={me.acShowFileOperations}
								/>
							</TabPane>
						</Tabs>
					</Col>
				</Row>

				{ me.state.isGhostWindowVisible && me.getGhostTransactionWindow()}
			</div>
		);
	}

	renderUploadButton() {
		let me = this;

		const {uiSingleCard} = me.props.appStore;
		const {card} = uiSingleCard;
		const url = card ? cardUploadUrl.replace(':id', uiSingleCard.card.id) : '';
		const token = getUserData('authorized');

		const props = {
			name          : 'operations',
			action        : url,
			headers       : {
				authorized: token
			},
			onChange      : (info) => {
				if (info.file.status === 'uploading') {
					uiSingleCard.setProperty('isLoading', true);
				}
				if (info.file.status === 'done') {
					const {item} = info.file.response;
					uiSingleCard.addUploadFile(item);
					me.changeCard('files', () => {
						uiSingleCard.cardFiles.load({id: card.id});
					});
					me.setState({isGhostWindowVisible: true, file: item});
					me.props.appStore.message('Файл успешно загружен.');
				} else if (info.file.status === 'error') {
					uiSingleCard.setProperty('isLoading', false);
					me.props.appStore.message('Ошибка загрузки файла.');
				}
			},
			showUploadList: false
		};

		const buttonStyle = {marginTop: 10, width: '100%'};

		return (
			<Upload {...props} style={buttonStyle}>
				<Button type="default" style={buttonStyle}>
					<Icon type="upload"/>Загрузить выписку
				</Button>
			</Upload>
		);
	}

	getGhostTransactionWindow() {
		let me = this;

		const {uiSingleCard: {card, ghostTransactions}} = me.props.appStore;

		return (
			<Modal
				style={{top: 20}}
				title="Загружаемые транзакции"
				wrapClassName="vertical-center-modal"
				visible={true}
				width={1200}
				footer={null}
				onCancel={me.acCloseTransactionsWindow}
			>
				<GhostTransactionsTable
					transactions={ghostTransactions}
					cardId={card.id}
					file={me.state.file}
					onSave={me.acSaveTransactions}
				/>
			</Modal>
		);
	}

	saveCard() {
		let me = this;
		const {uiSingleCard} = me.props.appStore;

		me.formRef.validateFields((err, values) => {
			if (!err) {
				uiSingleCard.saveCard(values);
			}
		});
	}

	showFileOperations(record) {
		let me = this;
		me.setState({isGhostWindowVisible: true, file: record});
	}

	saveGhostTransactions(data) {
		let me = this;

		const {uiSingleCard} = me.props.appStore;
		const {add, exists, total, opCount} = data;

		this.setState({isGhostWindowVisible: false}, () => {
			const desc = (<ul>
				<li>Новые: {add.length}</li>
				<li>Существующие: {exists.length}</li>
			</ul>);

			notification.open({
				message    : 'Операции по карте успешно сохранены!',
				description: desc,
				icon       : <Icon type="pay-circle" spin={true}/>,
			});

			uiSingleCard.cardFiles.load({id: uiSingleCard.card.id});
			uiSingleCard.card.setProperties({opCount, total});
		});
	}

	closeGhostTransactionWindow() {
		let me = this;
		const {uiSingleCard: {ghostTransactions}} = me.props.appStore;
		if (!ghostTransactions.isLoading) {
			ghostTransactions.clearAll();
			me.setState({isGhostWindowVisible: false, file: null});
		}
	}

	changeCard(key, callback) {
		this.setState({cardTabKey: key}, callback);
	}

	nextCard() {
		this.props.appStore.uiSingleCard.nextCard(this.props.history);
	}

	prevCard() {
		this.props.appStore.uiSingleCard.prevCard(this.props.history);
	}

}

CreditCardPage.propTypes = {};

export default CreditCardPage;
