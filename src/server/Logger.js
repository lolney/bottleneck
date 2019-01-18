import winston from 'winston';
require('winston-papertrail').Papertrail;
require('dotenv').config();
const { combine, timestamp, printf } = winston.format;

/*
{ 
  emerg: 0, 
  alert: 1, 
  crit: 2, 
  error: 3, 
  warning: 4, 
  notice: 5, 
  info: 6, 
  debug: 7
}
*/

const format = combine(
    timestamp(),
    printf((info) => {
        return `[${info.timestamp}] [${info.level}]: ${info.message}`;
    })
);

const transports = [new winston.transports.Console({ level: 'info' })];

if (process.env.PAPERTRAIL_HOST) {
    transports.push(
        new winston.transports.Papertrail({
            host: process.env.PAPERTRAIL_HOST,
            port: process.env.PAPERTRAIL_PORT,
            level: 'info'
        })
    );
} else {
    console.warn('PAPERTRAIL_HOST not set');
}

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    format,
    transports
});

export default logger;
