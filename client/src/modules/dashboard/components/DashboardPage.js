/**
 * Description of DashboardPage.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 25.06.18 13:10
 */
import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {Row, Col} from 'antd';
import CreditCardsList from '../../cards/components/CreditCardsList';
import {cardTitle} from './DashboardPage.module.css';
import AmountsByCategoryGraphView from './AmountsByCategoryGraphView';


@observer
class DashboardPage extends Component {

	componentDidMount() {
		let me = this;
		const {uiDashboard} = me.props.appStore;
		uiDashboard.load().then(() => {
			me.forceUpdate();
		});
		uiDashboard.updateExcludedCategories();
	}

	render() {
		let me = this;

		const {uiDashboard} = me.props.appStore;
		const {cards, amounts, excludeCategories} = uiDashboard;
		const selection = cards.getSelection(true);

		return (
			<div>
				<h2>Главная</h2>
				<Row gutter={4}>
					<Col span={8}>
						<h3 className={cardTitle}>Банковские карты</h3>
						<CreditCardsList
							cards={cards}
							selection={selection}
							onSelectCard={uiDashboard.selectCard}
						/>
					</Col>
					<Col span={16}>
						<h3>Потребление по категориям</h3>
						<AmountsByCategoryGraphView
							amounts={amounts}
							excludeCategories={excludeCategories.toJS()}
						/>
					</Col>
				</Row>
			</div>
		);
	}

}

export default DashboardPage;
