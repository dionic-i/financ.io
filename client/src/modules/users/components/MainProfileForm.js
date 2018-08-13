/**
 * Description of MainProfileForm.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 04.07.18 10:48
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Form, Input, Row, Col, Button, DatePicker, Spin} from 'antd';
import Rules from '../../../utils/fieldRules';
import moment from 'moment';
import {DEFAULT_DATE_FORMAT} from '../../core/models/constants';
import {observer} from 'mobx-react';
import {removeEmpty} from '../../../utils/helpers';

const FormItem = Form.Item;
const {stringRule} = Rules;


@observer
class MainProfileForm extends Component {

	render() {
		let me = this;

		const {getFieldDecorator} = me.props.form;

		const formItemLayout = {
			labelCol  : {
				xs: {span: 24},
				sm: {span: 8},
			},
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 16},
			},
		};

		const btnLayout = {
			wrapperCol: {
				xs: {span: 24},
				sm: {span: 16, offset: 4},
			},
		};

		const {
			email,
			profile: {
				username,
				firstname,
				secondname,
				birthday,
				lastActive,
				isLoading
			}
		} = me.props.user || {};

		const itemStyle = {marginBottom: 5};

		return (
			<Spin tip="Загрузка..." spinning={isLoading}>
				<Form onSubmit={me.handleSubmit}>
					<Row gutter={12}>
						<Col span={12}>

							<FormItem
								style={itemStyle}
								{...formItemLayout}
								label="Имя"
							>
								{getFieldDecorator('firstname', {
									initialValue: firstname,
									rules       : [stringRule(3, 50)]
								})(
									<Input placeholder="Введите имя"/>
								)}
							</FormItem>

							<FormItem
								style={itemStyle}
								{...formItemLayout}
								label="Фамилия"
							>
								{getFieldDecorator('secondname', {
									initialValue: secondname,
									rules       : [stringRule(3, 50)]
								})(
									<Input placeholder="Введите фамилию"/>
								)}
							</FormItem>

							<FormItem
								style={itemStyle}
								{...formItemLayout}
								label="Дата рождения"
							>
								{getFieldDecorator('birthday', {
									initialValue: birthday ? moment(birthday, DEFAULT_DATE_FORMAT) : ''
								})(
									<DatePicker style={{width: '100%'}} format={DEFAULT_DATE_FORMAT}/>
								)}
							</FormItem>

						</Col>

						<Col span={12}>

							<FormItem
								style={itemStyle}
								{...formItemLayout}
								label="Ник"
							>
								<span className="ant-form-text">{username}</span>
							</FormItem>

							<FormItem
								style={itemStyle}
								{...formItemLayout}
								label="Email"
							>
								<span className="ant-form-text">{email}</span>
							</FormItem>

							<FormItem
								style={itemStyle}
								{...formItemLayout}
								label="Последняя активность"
							>
								<span className="ant-form-text">{lastActive}</span>
							</FormItem>

						</Col>
					</Row>

					<Row gutter={12}>
						<FormItem
							{...btnLayout}
						>
							<Button type="primary" htmlType="submit" className="main-profile-form-button">
								Сохранить изменения
							</Button>
						</FormItem>
					</Row>
				</Form>
			</Spin>
		);
	}

	handleSubmit = (e) => {
		let me = this;
		e.preventDefault();
		const {form, user} = me.props;
		form.validateFields((err, values) => {
			if (!err) {
				values = removeEmpty(values);
				if (values.birthday) {
					values.birthday = values.birthday.format(DEFAULT_DATE_FORMAT);
				}
				user.profile.save(values);
				if (me.props.onSubmit) {
					me.props.onSubmit(values);
				}
			}
		});
	}
}

MainProfileForm.propTypes = {
	user    : PropTypes.object.isRequired,
	layout  : PropTypes.object,
	onSubmit: PropTypes.func
};

export default Form.create()(MainProfileForm);
