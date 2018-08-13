import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {Row, Col} from 'antd';

import ProfileTabs from './ProfileTabs';
import UserAvatar from './UserAvatar';
import config from '../../../utils/config';
import {getUserData} from '../../../utils/helpers';

const {apiPrefix} = config;
const {uploadAvatarUrl} = config[apiPrefix];


@observer
class ProfilePage extends Component {

	componentDidMount() {
		let me = this;
		const {user, uiCategories} = me.props.appStore;
		uiCategories.load(false);
		user.profile.load();
	}

	render() {
		let me = this;

		const {user, uiCategories} = me.props.appStore;
		const {categories} = uiCategories;
		const {profile} = user;

		return (
			<div>
				<h2>Профиль пользователя</h2>
				<Row gutter={12}>
					<Col span={4}>
						<h3>Аватарка</h3>
						<UserAvatar
							source={profile.avatar}
						    isDefault={profile.isDefaultAvatar}
						    isLoading={user.profile.isLoading}
						    uploadProps={me.getUploadProps()}
						    removeHandler={me.removeAvatarHandler}
						/>
					</Col>
					<Col span={20}>
						<h3>Информация</h3>
						<ProfileTabs
							user={user}
						    categories={categories}
						/>
					</Col>
				</Row>
			</div>
		);
	}

	getUploadProps() {
		let me = this;

		const {user} = me.props.appStore;
		const {profile} = user;

		return {
			name          : 'avatars',
			action        : uploadAvatarUrl,
			headers       : {
				authorized: getUserData('authorized')
			},
			onChange      : (info) => {
				if (info.file.status === 'uploading') {
					user.profile.setIsLoading(true);
				}
				if (info.file.status === 'done') {
					const {item} = info.file.response;
					profile.setAvatar(item.avatar);
					me.props.appStore.message('Аватарка успешно загружена.');
					user.profile.setIsLoading(false);
				} else if (info.file.status === 'error') {
					user.profile.setIsLoading(false);
					me.props.appStore.error('Ошибка загрузки файла аватарки.');
				}
			},
			showUploadList: false
		};
	}

	removeAvatarHandler = () => {
		this.props.appStore.user.profile.removeAvatar();
	}

}

export default ProfilePage;
