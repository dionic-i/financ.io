import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import {Button, Tooltip, Spin} from 'antd';
import moment from 'moment';
import ReactHighcharts from 'react-highcharts';
import PeriodSelection from '../../core/components/PeriodSelection';


@observer
class AmountsByCategoryGraphView extends Component {

	render() {
		let me = this;
		return (
			<div>
				{me.getToolbar()}
				{me.renderAmounts()}
			</div>
		);
	}

	getToolbar() {
		let me = this;

		const {amounts} = me.props;
		const {start, end} = amounts.getParams();

		return (
			<div style={{marginBottom: 5}}>

				<PeriodSelection
					startDate={moment(start)}
					endDate={moment(end)}
					onSelect={amounts.changePeriod}
					quickProps={{
						onNext   : amounts.nextPeriod,
						onPrev   : amounts.prevPeriod,
						onCurrent: amounts.currentPeriod,
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
			</div>
		);
	}

	renderAmounts() {
		let me = this;
		const {amounts} = me.props;
		return (
			<Spin tip="Загрузка..." spinning={amounts.isLoading} size="large">
				<ReactHighcharts config={me.getChartConfig()}/>
			</Spin>
		)
	}

	getChartConfig() {
		let me = this;

		const {amounts, excludeCategories} = me.props;
		const data = amounts.data.toJS();

		let series = [];
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			if (excludeCategories.indexOf(item.id) === -1) {
				series.push([item.name, item.amount]);
			}
		}

		return {
			chart : {
				type: 'column'
			},
			title : {
				text: ''
			},
			xAxis : {
				type  : 'category',
				title : {
					text: 'Категории потребления'
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
					format  : '{point.y:.2f}', // two decimal
					y       : 10,
					style   : {
						fontSize  : '11px',
						fontFamily: 'Verdana, sans-serif'
					}
				}
			}]
		};
	}

	refresh = () => {
		this.props.amounts.load();
	};

}

AmountsByCategoryGraphView.propTypes = {
	amounts          : PropTypes.object.isRequired,
	excludeCategories: PropTypes.array.isRequired
};

export default AmountsByCategoryGraphView;

