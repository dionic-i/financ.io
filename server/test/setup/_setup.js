const bodyParser = require('body-parser');
const express = require('express');

const config = require('../../config');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';
dotenv.load({path: './config/env/.env.test'});

console.log('=== DB CONFIGURATION ===');
console.log('DB_NAME: ', process.env.DB_NAME);
console.log('DB_HOST: ', process.env.DB_HOST);
console.log('DB_USERNAME: ', process.env.DB_USER);
console.log('DB_PASSWORD: ', process.env.DB_PASS);

const database = require('../../config/database');

const beforeAction = async () => {
	const testapp = express();

	// const mappedOpenRoutes = mapRoutes(config.publicRoutes, 'api/controllers/');
	// const mappedAuthRoutes = mapRoutes(config.privateRoutes, 'api/controllers/');

	testapp.use(bodyParser.urlencoded({extended: false}));
	testapp.use(bodyParser.json());

	// testapp.use('/public', mappedOpenRoutes);
	// testapp.use('/private', mappedAuthRoutes);

	// testapp.all('/private/*', (req, res, next) => auth(req, res, next));

	await database.authenticate();

	// await database.drop();
	// await database.sync().then(() => console.log('Connection to the database has been established successfully'));

	return testapp;
};

const auth = async () => {
	await database.authenticate()
		.then(() => {
			console.log('Connection has been established successfully.');
		}).catch(err => {
			console.error('Unable to connect to the database:', err.toString());
		});
};

const afterAction = async () => {
	await database.close();
};

module.exports = {auth, beforeAction, afterAction};
