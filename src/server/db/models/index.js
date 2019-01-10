'use strict';
import logger from '../../Logger';

require('dotenv').config();
let fs = require('fs');
let path = require('path');
let Sequelize = require('sequelize');
let basename = path.basename(__filename);
let env = process.env.NODE_ENV || 'development';
let config = require(__dirname + '/../config/config.json')[env];
let db = {};

var pg = require('pg');
delete pg.native;

var BASE_CONFIG = {
    logging: (sql, sequelizeObject) => logger.debug.bind(logger)(sql),
    dialect: 'postgres',
    protocol: 'postgres'
};
config = { ...config, ...BASE_CONFIG };

if (process.env.DATABASE_URL) {
    // the application is executed on Heroku ... use the postgres database
    var sequelize = new Sequelize(process.env.DATABASE_URL, config);
} else if (process.env.RDS_HOSTNAME) {
    // aws (elastic beanstalk)
    var sequelize = new Sequelize({
        ...BASE_CONFIG,
        host: process.env.RDS_HOSTNAME,
        username: process.env.RDS_USERNAME,
        password: process.env.RDS_PASSWORD,
        port: process.env.RDS_PORT
    });
} else if (config.use_env_variable) {
    console.log(process.env);
    var sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    var sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
        );
    })
    .forEach((file) => {
        let model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
