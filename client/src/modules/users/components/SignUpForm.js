/**
 * Description of SignUpForm.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.04.18 17:33
 */
import React, {Component} from 'react';
import {Form, Button, Input, Icon, Row, Col, DatePicker} from 'antd';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import Rules from '../../../utils/fieldRules';
import AsyncValidators from '../../../utils/asyncValidators';
import config from '../../../utils/config';

const {apiPrefix} = config;
const {checkEmailUrl} = config[apiPrefix];

const {
	requiredRule,
	emailRule,
	stringRule,
	validateToNextPasswordRule,
	compareFirstPasswordRule
} = Rules;
const {checkEmailValidator} = AsyncValidators;
const FormItem = Form.Item;


@observer
class SignUpForm extends Component {

	render() {
		let me = this;

		const {auth, form} = me.props;
		const {getFieldDecorator} = form;
		const formItemLayout = {
			wrapperCol: {span: 8, offset: 8}
		};

		return (
			<Form onSubmit={me.handleSubmit} className="login-form">
				<Row gutter={8}>
					<Col span={4} offset={8}>
						<h4>Аккаунт</h4>
					</Col>
				</Row>
				<Row gutter={8}>
					<Col span={8} offset={8}>
						<FormItem>
							{getFieldDecorator('email', {
								validateFirst: true,
								rules       : [requiredRule, emailRule, checkEmailValidator(checkEmailUrl)],
								initialValue: auth.email
							})(
								<Input
									prefix={<Icon type="mail" style={{color: 'rgba(0,0,0,.25)'}}/>}
									placeholder="Email"
								/>
							)}
						</FormItem>
						<FormItem>
							{getFieldDecorator('password', {
								rules       : [requiredRule, stringRule(6, 20), validateToNextPasswordRule(form, 'repassword')],
								initialValue: auth.password
							})(
								<Input
									prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
									type="password"
									placeholder="Пароль"
								/>
							)}
						</FormItem>
						<FormItem>
							{getFieldDecorator('repassword', {
								rules       : [requiredRule, stringRule(6, 20), compareFirstPasswordRule(form, 'password')],
								initialValue: auth.password
							})(
								<Input
									prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
									type="password"
									placeholder="Подтвердите пароль"
								/>
							)}
						</FormItem>
					</Col>
				</Row>

				<Row gutter={8}>
					<Col span={4} offset={8}>
						<h4>Профиль</h4>
					</Col>
				</Row>

				<Row gutter={8}>
					<Col span={4} offset={8}>
						<FormItem >
							{getFieldDecorator('username', {
								rules: [stringRule(3, 50)],
							})(
								<Input
									prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
									placeholder="Логин"
								/>
							)}
						</FormItem>
					</Col>
					<Col span={4}>
						<FormItem>
							{getFieldDecorator('birthday', {})(
								<DatePicker
									placeholder="Дата рождения"
									style={{width: '100%'}}
								/>
							)}
						</FormItem>
					</Col>
				</Row>

				<Row gutter={8}>
					<Col span={4} offset={8}>
						<FormItem >
							{getFieldDecorator('firstname', {
								rules: [stringRule(3, 50)],
							})(
								<Input
									prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
									placeholder="Имя"
								/>
							)}
						</FormItem>
					</Col>
					<Col span={4}>
						<FormItem>
							{getFieldDecorator('secondname', {
								rules: [stringRule(3, 50)],
							})(
								<Input
									prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
									placeholder="Фамилия"
								/>
							)}
						</FormItem>
					</Col>
				</Row>

				<FormItem {...formItemLayout}>
					<Button type="primary" htmlType="submit" className="login-form-button">
						Создать аккаунт
					</Button>
				</FormItem>
			</Form>
		)
	}

	handleSubmit = (e) => {
		let me = this;
		e.preventDefault();
		const {auth} = me.props;
		me.props.form.validateFields((err, values) => {
			if (!err) {
				auth.register(values);
			}
		});
	}

}

SignUpForm.propTypes = {
	auth: PropTypes.object.isRequired
};

export default Form.create()(SignUpForm);
