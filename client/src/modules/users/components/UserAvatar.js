/**
 * Description of UserAvatar.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 06.08.18 11:51
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Button, Icon, Spin, Upload} from 'antd';

function UserAvatar({source, isDefault, isLoading, removeHandler, uploadProps}) {

	const buttonStyle = {marginTop: 10, width: '100%'};

	return (
		<div>
			<Spin spinning={isLoading}>
				<img style={{width: '100%'}} src={source} alt=""/>
				<div id="avatar-upload">
					<Upload {...uploadProps} style={buttonStyle}>
						<Button type="default" style={buttonStyle}>
							<Icon type="upload"/>Загрузить аватарку
						</Button>
					</Upload>
				</div>
				{
					!isDefault &&
					<Button style={buttonStyle} type="danger" onClick={removeHandler}>
						<Icon type="save"/>Удалить аватарку
					</Button>
				}
			</Spin>
		</div>
	);
}

UserAvatar.propTypes = {
	source       : PropTypes.string.isRequired,
	isDefault    : PropTypes.bool.isRequired,
	isLoading    : PropTypes.bool.isRequired,
	removeHandler: PropTypes.func.isRequired,
	uploadProps  : PropTypes.object
};

export default UserAvatar;
