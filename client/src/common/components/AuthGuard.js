/**
 * Description of AuthGuard.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 12.04.18 14:57
 */
import React from 'react';
import {inject, observer} from 'mobx-react';
import {Redirect} from "react-router-dom";

export function AuthGuard(Component) {

	@inject('appStore')
	@observer
	class AuthenticatedComponent extends React.Component {

		componentWillMount() {
			let me = this;
			const {auth} = me.props.appStore;
			me.checkAuth(auth.isAuth);
		}

		checkAuth(isAuthenticated) {
		}

		render() {
			let me = this;
			const {auth} = me.props.appStore;
			return (
				<div>
					{auth.isAuth === true ? <Component {...this.props} /> : <Redirect to={'/login'}/>}
				</div>
			)
		}
	}

	AuthenticatedComponent.propTypes = {};

	return AuthenticatedComponent;
}
