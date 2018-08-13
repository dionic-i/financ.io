import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Redirect} from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import {aCenter} from '../../../theme/src/common.module.less';


@inject('appStore')
@observer
class LoginPage extends Component {

	render() {
		let me = this;
		const {auth} = me.props.appStore;
		return auth.isAuth
			? (<div><Redirect to={'/'}/></div>)
			: (
				<div>
					<h3 className={aCenter}>Авторизация</h3>
					<LoginForm auth={auth} />
				</div>
			);
	}

}

export default LoginPage;
