/**
 * Description of CategoriesAmountReport.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 11.07.18 20:46
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
class CategoriesAmountReport extends Component {

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

		const {store, categories: userCategories, cards: userCards} = me.props;
		const {start, end, cards, categories} = store.getParams();

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
					tooltip="Выбор категорий"
					buttonProps={{icon: 'book'}}
					entities={userCategories.data.toJS()}
					selection={categories}
					onSelect={me.selectCategories}
				/>

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
		const {series} = store.getGraphConfig();

		const config = {
			chart : {
				type: 'column'
			},
			title : {
				text: ''
			},
			xAxis : {
				type  : 'category',
				title : {
					text: 'Год - Месяц'
				},
				labels: {
					rotation: -45,
					style   : {
						fontSize  : '11px',
						fontFamily: 'Verdana, sans-serif'
					}
				}
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
			series: [{
				name      : 'Сумма, руб',
				data      : series,
				dataLabels: {
					enabled : true,
					rotation: -90,
					color   : '#FFFFFF',
					align   : 'right',
					format  : '{point.y:.2f}',
					y       : 10,
					style   : {
						fontSize  : '11px',
						fontFamily: 'Verdana, sans-serif'
					}
				}
			}]
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
			width    : 160,
			align    : 'center',
			render   : dateRenderer()
		}, {
			title    : 'Сумма, руб',
			dataIndex: 'amount',
			width    : 200,
			align    : 'center',
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

	selectCategories = (items) => {
		let me = this;
		me.props.store.selectCategories(items);
		me.forceUpdate();
	};

	selectCards = (items) => {
		let me = this;
		me.props.store.selectCards(items);
		me.forceUpdate();
	}

}

CategoriesAmountReport.propTypes = {
	store     : PropTypes.object.isRequired,
	categories: PropTypes.object.isRequired,
	cards     : PropTypes.object.isRequired,
};

export default CategoriesAmountReport;
