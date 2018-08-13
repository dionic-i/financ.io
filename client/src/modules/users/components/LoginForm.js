/**
 * Description of LoginForm.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 05.04.18 17:33
 */
import React, {Component} from 'react';
import {Form, Button, Input, Icon} from 'antd';
import {observer} from 'mobx-react';
import PropTypes from 'prop-types';
import Rules from '../../../utils/fieldRules';

const {requiredRule, emailRule, stringRule} = Rules;
const FormItem = Form.Item;


@observer
class LoginForm extends Component {

	render() {
		let me = this;

		const {getFieldDecorator} = me.props.form;
		const {auth} = me.props;
		const formItemLayout = {
			wrapperCol: { span: 8, offset: 8}
		};

		return (
			<Form onSubmit={me.handleSubmit} className="login-form">
				<FormItem {...formItemLayout}>
					{getFieldDecorator('email', {
						rules: [requiredRule, emailRule],
						initialValue: auth.email
					})(
						<Input
							prefix={<Icon type="mail" style={{color: 'rgba(0,0,0,.25)'}}/>}
							placeholder="Email"
						/>
					)}
				</FormItem>
				<FormItem {...formItemLayout}>
					{getFieldDecorator('password', {
						rules: [requiredRule, stringRule(6, 20)],
						initialValue: auth.password
					})(
						<Input
							prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
							type="password"
							placeholder="Пароль"
						/>
					)}
				</FormItem>
				<FormItem {...formItemLayout}>
					<Button type="primary" htmlType="submit" className="login-form-button">
						Войти
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
				auth.setCredentials(values);
				auth.login(...values);
			}
		});
	}
}

LoginForm.propTypes = {
	auth: PropTypes.object.isRequired
};

export default Form.create()(LoginForm);
