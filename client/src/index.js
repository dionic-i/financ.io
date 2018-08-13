import ReactDOM from 'react-dom';
import React from 'react';
import {Provider} from 'mobx-react';
import {connectReduxDevtools} from 'mst-middlewares';
import {onSnapshot, onPatch, getSnapshot} from 'mobx-state-tree';
import Root from './root';
import {RootModel} from './modules/core/models/root';
import './theme/build/index.css';

const stores = {
	appStore  : RootModel.create()
};

connectReduxDevtools(require("remotedev"), stores.appStore);

onSnapshot(stores.appStore, snapshot => {
	// console.log('Snapshot create: ', snapshot);
});

onPatch(stores.appStore, patch => {
	// console.log("Patch create: ", patch)
});

const renderApp = (stores) => {
	ReactDOM.render(
		(
			<Provider {...stores}>
				<Root />
			</Provider>
		),
		document.getElementById('root')
	);
};

renderApp(stores);

if (module.hot) {

	// New component
	module.hot.accept([
		'./root',
		'./theme/build/index.css'
	], () => {
		renderApp(stores);
	});

	// New store
	module.hot.accept([
		'./modules/core/models/root',
	], () => {
		const appStoreSn = getSnapshot(stores.appStore);
		const newStores = {
			appStore  : RootModel.create(appStoreSn),
		};
		renderApp(newStores);
	});

}
