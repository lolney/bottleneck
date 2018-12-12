import winston from 'winston';

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

const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({
            filename: 'log.log',
            level: 'debug'
        })
    ]
});

export default logger;
