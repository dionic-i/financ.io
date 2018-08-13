/**
 * Description of ReportsPage.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 10.07.18 20:25
 */
import React, {Component} from 'react';
import {observer} from 'mobx-react';
import ReportTypeTabs from './ReportTypeTabs';
import CategoriesAmountReport from './CategoriesAmountReport';
import CardsAmountReport from './CardsAmountReport';


@observer
class ReportsPage extends Component {

	constructor(props) {
		super(props);
		let me = this;

		const {uiReports, uiCategories, uiDashboard} = props.appStore;
		const {categoriesAmount, cardsAmount} = uiReports;

		me.reports = [{
			key   : 'by-categories',
			title : 'Расход по категориям',
			report: (<CategoriesAmountReport
				store={categoriesAmount}
				categories={uiCategories.categories}
			    cards={uiDashboard.cards}
			/>)
		}, {
			key   : 'by-cards',
			title : 'Баланс по картам',
			report: (<CardsAmountReport
				store={cardsAmount}
				cards={uiDashboard.cards}
			/>)
		}];
	}

	render() {
		let me = this;
		const {uiReports} = me.props.appStore;
		return (
			<div>
				<h2>Отчеты</h2>
				<ReportTypeTabs
					list={me.reports}
					activeKey={uiReports.activeReportKey}
					onChange={uiReports.changeReportType}
				/>
			</div>
		);
	}
}

export default ReportsPage;
