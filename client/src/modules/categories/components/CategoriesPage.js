/**
 * Description of CategoriesPage.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 23.05.18 14:40
 */
import React, {Component} from 'react';
import {Row, Col} from 'antd';
import {observer} from 'mobx-react';
import CategoriesTable from './CategoriesTable';
import PatternsTable from "./PatternsTable";


@observer
class CategoriesPage extends Component {

	componentDidMount() {
		let me = this;
		const {uiCategories} = me.props.appStore;
		uiCategories.loadCategories().then(() => {
			me.forceUpdate();
		});
	}

	render() {
		let me = this;

		const {uiCategories} = me.props.appStore;

		return (
			<div>
				<div>
					<h2>Категории</h2>
					<Row gutter={16}>
						<Col span={8}>
							<h3>Список категорий</h3>
							<CategoriesTable
								categories={uiCategories.categories}
							    onSelect={me.onSelectCategory}
							    selectCount={uiCategories.categories.selCount}
							/>
						</Col>
						<Col span={16}>
							<h3>Список шаблонов категории</h3>
							<PatternsTable
								patterns={uiCategories.patterns}
								categories={uiCategories.categories}
							/>
						</Col>
					</Row>
				</div>
			</div>
		);
	}

	onSelectCategory = () => {
		let me = this;
		const {uiCategories} = me.props.appStore;
		const {categories, patterns} = uiCategories;
		const category = categories.firstSelectItem;

		if (category) {
			patterns.loadByCategory(category.id);
		}
	}

}

export default CategoriesPage;
