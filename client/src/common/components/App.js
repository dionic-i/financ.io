import React from 'react';
import {withRouter} from 'react-router-dom';
import {inject, observer} from 'mobx-react';
import {onPatch} from 'mobx-state-tree';
import {Layout, Spin, message as messageNote, notification as notificationNote} from 'antd';
import Menu from './Menu';
import {ERROR_NOTE, SUCCESS_NOTE, WARNING_NOTE, INFO_NOTE} from '../../modules/core/models/errorStore';

const {Content, Footer, Header} = Layout;

@inject('appStore')
@withRouter
@observer
export default class App extends React.Component {

	componentDidMount() {
		let me = this;

		const {messages, notifications, errors} = me.props.appStore;

		// Light user messages
		onPatch(messages, (patch) => {
			if (patch.op === 'add') {
				const {message, type} = patch.value;
				switch (type) {
					case SUCCESS_NOTE:
						messageNote.success(message);
						break;
					case WARNING_NOTE:
						messageNote.warning(message);
						break;
					case ERROR_NOTE:
						messageNote.error(message);
						break;
					default:
						throw new Error('Error message operation type.');
				}
			}
		});

		// Complex user notifications
		onPatch(notifications, (patch) => {
			if (patch.op === 'add') {
				const {title: message, description, type} = patch.value;

				const desc = (<div>{description}</div>);

				switch (type) {
					case SUCCESS_NOTE:
						notificationNote.success({message, description: desc});
						break;
					case WARNING_NOTE:
						notificationNote.warning({message, description: desc});
						break;
					case INFO_NOTE:
						notificationNote.info({message, description: desc});
						break;
					case ERROR_NOTE:
						notificationNote.error({message, description: desc});
						break;
					default:
						throw new Error('Error notification operation type.');
				}
			}
		});

		// Params validation errors
		onPatch(errors, (patch) => {
			if (patch.op === 'add') {
				const {title, list} = patch.value;
				const items = list.map((item, index) => (<li key={index}>Параметр: {item.param}: {item.msg}</li>));
				const ul = (<ul>{items}</ul>);
				notificationNote.error({message: title, description: ul});
			}
		});
	}

	render() {
		let me = this;

		const {children} = me.props;

		return me.props.appStore.appLoaded
			? (
				<Layout style={{height: '100vh', overflow: 'scroll'}} id="mainContainer">
					<Header>
						<Menu />
					</Header>
					<Content>
						{children}
					</Content>
					<Footer>
						<h5>Financ.io</h5>
					</Footer>
				</Layout>
			)
			: (
				<div style={{textAlign: 'center', marginTop: 200}}>
					<h1>
						Financio
					</h1>
					<div>
						<Spin tip="Идет загрузка приложения..." size="large"/>
					</div>
				</div>
			);
	}

}
