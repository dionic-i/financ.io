/**
 * Description of sync.
 *
 *
 * @author: Ilya Petrushenko <ilya.petrushenko@yandex.ru>
 * @since: 27.04.18 13:20
 */

const dotenv = require('dotenv');
const chalk = require('chalk');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: './config/env/.env.dev'});

const environment = 'sync';
const dbService = require('../src/services/db.service');
const DB = dbService(environment, false);

DB.start();
