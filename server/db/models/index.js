'use strict';

const db = require('../../config/database');
const models = require('../../src/models');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
