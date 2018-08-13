/**
 * Description of CardsAmountReport.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.07.18 20:47
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {Button, Tooltip, Spin, Table, Col, Row} from 'antd';
import moment from 'moment';
import ReactHighcharts from 'react-highcharts';
import PeriodSelection from '../../core/components/PeriodSelection';
import EntitiesChoiceButton from '../../core/components/EntitiesChoiceButton';
import {dateRenderer} from '../../../utils/columnRenderers';
import {YEAR} from '../../core/components/QuickPeriodSwitcher';


@observer
class CardsAmountReport extends Component {

	componentDidMount() {
		this.props.store.loadAmounts();
	}

	render() {
		let me = this;
		return (
			<div>
				{me.getToolbar()}
				<Row gutter={8}>
					<Col md={24} lg={16}>
						{me.getGraph()}
					</Col>
					<Col md={24} lg={8}>
						{me.getTable()}
					</Col>
				</Row>
			</div>
		);
	}

	getToolbar() {
		let me = this;

		const {store, cards: userCards} = me.props;
		const {start, end, cards} = store.getParams();

		return (
			<div style={{marginBottom: 5}}>

				<PeriodSelection
					startDate={moment(start)}
					endDate={moment(end)}
					onSelect={store.changePeriod}
					quickProps={{
						onNext   : store.nextPeriod,
						onPrev   : store.prevPeriod,
						onCurrent: store.currentPeriod,
						type     : YEAR
					}}
				/>

				<Tooltip title="Обновить" overlay="">
					<Button
						style={{float: 'right'}}
						type="normal"
						icon="reload"
						onClick={store.load}>
					</Button>
				</Tooltip>

				<EntitiesChoiceButton
					tooltip="Выбор карт"
					buttonProps={{icon: 'credit-card'}}
					entities={userCards.data.toJS()}
					selection={cards}
					onSelect={me.selectCards}
				/>
			</div>
		);
	}

	getGraph() {
		let me = this;

		const {store} = me.props;
		const {series, categories} = store.graphConfig();

		const config = {
			chart : {
				type: 'column'
			},
			title : {
				text: ''
			},
			xAxis : {
				categories: categories,
				crosshair : true
			},
			yAxis : {
				min  : 0,
				title: {
					text: 'Cумма, руб. '
				}
			},
			legend: {
				enabled: false
			},
			series: series
		};

		return (
			<Spin tip="Загрузка..." spinning={store.isLoading} size="large">
				<ReactHighcharts config={config}/>
			</Spin>
		)
	}

	getTable() {
		let me = this;
		const {store} = me.props;

		const columns = [{
			title    : 'Период',
			dataIndex: 'iddate',
			width    : 120,
			align    : 'center',
			render   : dateRenderer()
		}, {
			title    : 'Приход, руб',
			dataIndex: 'income',
			width    : 120,
			align    : 'center',
		}, {
			title    : 'Расход, руб',
			dataIndex: 'outcome',
			width    : 120,
			align    : 'center',
		}, {
			title    : 'Сальдо, руб',
			dataIndex: 'saldo',
			width    : 120,
			align    : 'center'
		}];

		return (
			<div>
				<Table
					rowKey="id"
					bordered={true}
					columns={columns}
					dataSource={store.data.toJS()}
					loading={store.isLoading}
					pagination={false}
				/>
			</div>
		)
	}

	selectCards = (items) => {
		let me = this;
		me.props.store.selectCards(items);
		me.forceUpdate();
	}

}

CardsAmountReport.propTypes = {
	store: PropTypes.object.isRequired,
	cards: PropTypes.object.isRequired
};

export default CardsAmountReport;
