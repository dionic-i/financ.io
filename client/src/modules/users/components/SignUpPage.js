import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Redirect} from 'react-router-dom';
import SignUpForm from './SignUpForm';
import {aCenter} from '../../../theme/src/common.module.less';


@inject('appStore')
@observer
class SignUpPage extends Component {

	render() {
		let me = this;
		const {auth} = me.props.appStore;
		return auth.isAuth
			? (<div><Redirect to={'/'}/></div>)
			: (
				<div>
					<h3 className={aCenter}>Регистрация</h3>
					<SignUpForm auth={auth} />
				</div>
			);
	}

}

SignUpPage.propTypes = {};

export default SignUpPage;
