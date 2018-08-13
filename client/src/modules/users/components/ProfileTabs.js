/**
 * Description of ProfileTabs.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 04.07.18 9:49
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tabs} from 'antd';
import MainProfileForm from './MainProfileForm';
import UserCategoriesTags from './UserCategoriesTags';
import {observer} from 'mobx-react';
const TabPane = Tabs.TabPane;

@observer
class ProfileTabs extends Component {

	render() {
		let me = this;

		const {categories, user} = me.props;
		const cats = categories.data.toJS();
		const {profile: {excludeGraphCategories}} = user;

		return (
			<Tabs>
				<TabPane tab="Основная" key="main">
					<MainProfileForm
						user={user}
					/>
				</TabPane>
				<TabPane tab="Настройки" key="settings">
					<UserCategoriesTags
						title="Список категорий, исключенных из графиков"
						categories={cats}
						selection={excludeGraphCategories}
						onCheck={me.checkCategory}
					/>
				</TabPane>
			</Tabs>
		);
	}

	checkCategory = (item, check) => {
		this.props.user.profile.checkCategory(item, check);
	}

}

ProfileTabs.defaultProps = {};

ProfileTabs.propTypes = {
	user      : PropTypes.object,
	categories: PropTypes.object
};

export default ProfileTabs;
