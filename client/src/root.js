import React from 'react';
import {HashRouter} from 'react-router-dom';
import {Switch, Route} from 'react-router-dom';

import App from './common/components/App';
import DashboardPage from './modules/dashboard/components/DashboardPage';
import ReportsPage from './modules/reports/components/ReportsPage';
import CategoriesPage from './modules/categories/components/CategoriesPage';
import CreditCardPage from './modules/cards/components/CreditCardPage';
import ProfilePage from './modules/users/components/ProfilePage';
import LoginPage from './modules/users/components/LoginPage';
import SignUpPage from './modules/users/components/SignUpPage';
import ErrorPage from './common/components/ErrorPage';
import {AuthGuard} from './common/components/AuthGuard';
import {LocaleProvider} from 'antd';
import ru_RU from 'antd/lib/locale-provider/ru_RU';
import 'moment/locale/ru';


class Root extends React.Component {

	render() {
		return (
			<HashRouter>
				<LocaleProvider locale={ru_RU}>
					<App>
						<Switch>
							<Route key="index" exact path="/" component={AuthGuard(DashboardPage)}/>
							<Route key="categories" exact path="/categories" component={AuthGuard(CategoriesPage)}/>
							<Route key="reports" exact path="/reports" component={AuthGuard(ReportsPage)}/>
							<Route key="profile" exact path="/profile" component={AuthGuard(ProfilePage)}/>
							<Route key="card" exact path="/card/:id" component={AuthGuard(CreditCardPage)}/>
							<Route key="login" exact path="/login" component={LoginPage}/>
							<Route key="signup" exact path="/signup" component={SignUpPage}/>
							<Route component={ErrorPage}/>
						</Switch>
					</App>
				</LocaleProvider>
			</HashRouter>
		)
	}
}

export default Root;
