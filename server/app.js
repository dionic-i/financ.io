/**
 * Module dependencies.
 */
const http = require('http');
const path = require('path');
const express = require('express');
const compression = require('compression');
const session = require('express-session');

// const MongoStore = require('connect-mongo')(session);

const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const multer = require('multer');
const expressValidator = require('express-validator');
const logger = require('morgan');

// const mongoose = require('mongoose');

const dotenv = require('dotenv');
const chalk = require('chalk');
const cookieParser = require('cookie-parser');
const errorHandler = require('errorhandler');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: './config/env/.env.dev'});
console.log('=== DB CONFIGURATION ===');
console.log('DB_NAME: ', process.env.DB_NAME);
console.log('DB_HOST: ', process.env.DB_HOST);
console.log('DB_USERNAME: ', process.env.DB_USER);
console.log('DB_PASSWORD: ', process.env.DB_PASS);

/**
 * Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Express application
 */
const app = express();

const UPLOAD_BASE = path.join(__dirname, 'uploads');
const USER_AVATARS_BASE = path.join(__dirname, 'public', 'images', 'avatars');

app.set('UPLOAD_BASE', UPLOAD_BASE);
app.set('USER_AVATARS_BASE', USER_AVATARS_BASE);

const upload = multer({
	dest: UPLOAD_BASE,
	filename: function (req, file, cb) {
		const ext = file.originalname.split('.')[1];
		cb(null, file.filename + '.' + ext);
	}
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(session({
	resave           : true,
	saveUninitialized: true,
	secret           : process.env.SESSION_SECRET,
	cookie           : {maxAge: 1209600000}, // two weeks in milliseconds
}));
app.use(passport.initialize());
app.use(passport.session());


// environment: development, staging, testing, production
// const environment = process.env.NODE_ENV;
const environment = 'development';
const dbService = require('./src/services/db.service');
const DB = dbService(environment, false);

DB.start();

const database = DB.getSequalize();
app.set('db', database);

// allow cross origin requests
// configure to only allow requests from certain origins
app.use(cors());

// secure express app
app.use(helmet({
	dnsPrefetchControl: false,
	frameguard        : false,
	ieNoOpen          : false
}));

/**
 * Static resource
 */
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));


/**
 * DataLoader
 */
const dataLoader = require('./src/modules/core/services/dataLoader');
app.set('dataLoader', dataLoader);

/**
 * ACL
 */
const acl = require('./src/acl')({
	app,
	database
});

/**
 * Cluster logger
 */
app.use(require('./src/services/cluster-log.service')());

/**
 * User activity logger
 */
app.use(require('./src/services/user-activity-log.service')());

/**
 * Route configurations. Add only at the end.
 */
require('./src/routes.js')({
	app,
	passport,
	passportConfig,
	upload,
	UPLOAD_BASE,
	USER_AVATARS_BASE,
	acl,
	database
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Clusterization.
 * Start Express server.
 */

function startServer() {
	app.listen(app.get('port'), () => {
		console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
		console.log('  Press CTRL-C to stop\n');

		return DB.getSequalize();
	});
}

if (require.main === module) {
	startServer();
} else {
	module.exports = startServer;
}
