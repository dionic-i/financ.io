'use strict';

const dotenv = require('dotenv');

const models = require('../src/models');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: './config/env/.env.dev'});

const db = {
	username      : process.env.DB_USER,
	password      : process.env.DB_PASS,
	database      : process.env.DB_NAME,
	host          : process.env.DB_HOST,
	dialect       : "postgres",
};

module.exports = {
	development: db,
	test       : db,
	production : db
};
