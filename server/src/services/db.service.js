const database = require('../../config/database');

const models = require('../models');

const dbService = (environment, migrate) => {

	const authenticateDB = () => (
		database.authenticate()
	);

	const closeDB = () => (
		database.close()
	);

	const dropDB = () => (
		database.drop()
	);

	const syncDB = (force = false) => (
		database.sync({force})
	);

	const initDbFromBackup = () => {
	};

	const successfulDBStart = () => (
		console.info('connection to the database has been established successfully')
	);

	const errorDBStart = (err) => (
		console.info('unable to connect to the database:', err)
	);

	const wrongEnvironment = () => {
		console.warn(`only development, staging, test and production are valid NODE_ENV variables but ${environment} is specified`);
		return process.exit(1);
	};

	const startMigrateTrue = (force = false) => (
		syncDB(force)
			.then(() => successfulDBStart())
			.catch((err) => errorDBStart(err))
	);

	const startMigrateFalse = () => (
		dropDB()
			.then(() => (
					syncDB()
						.then(() => successfulDBStart())
						.catch((err) => errorDBStart(err))
				)
					.catch((err) => errorDBStart(err)),
			)
	);

	const startDev = () => (
		authenticateDB()
	);

	const startStage = () => (
		authenticateDB()
			.then(() => {
				if (migrate) {
					return startMigrateTrue();
				}

				return startMigrateFalse();
			})
	);

	const startTest = () => (
		authenticateDB()
			.then(() => startMigrateFalse())
	);

	const startProd = () => (
		authenticateDB()
			.then(() => startMigrateFalse())
	);

	const startSync = () => (
		authenticateDB()
			.then(() => startMigrateTrue(true))
			.then(() => closeDB())
	);

	const startInit = () => (
		authenticateDB()
			.then(() => initDbFromBackup())
			.then(() => closeDB())
	);

	const getSequalize = () => {
		return database;
	};

	const start = () => {
		switch (environment) {
			case 'development':
				return startDev();
			case 'staging':
				return startStage();
			case 'testing':
				return startTest();
			case 'production':
				return startProd();
			case 'sync':
				return startSync();
			case 'init':
				return startInit();
			default:
				return wrongEnvironment();
		}
	};

	return {
		getSequalize,
		start,
	};
};

module.exports = dbService;
