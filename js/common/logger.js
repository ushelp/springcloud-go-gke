const moment = require('moment');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
var logger;


function initLogger(logFileName){
    
   let logger = winston.createLogger({
      // levels: winston.config.syslog.levels,
      level: 'info',
      
      // defaultMeta: { service: 'user-service' },
      transports: [
          new winston.transports.Console({
              // level: 'debug'
    		 format: winston.format.combine(
    		     winston.format.colorize(),
    		     // winston.format.json()
    		     //winston.format.simple()
    			winston.format.combine(
    				// winston.format.json()
    				// winston.format.simple()
    				winston.format.printf(({ level, message }) => {
    				  // return `${level}: ${message}`;
    				  return `${level} [`+moment().format("YYYY-MM-DD HH:mm:ss:SSS")+`] ${message}`;
    				})
    			 )
    		  )
          }),
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.DailyRotateFile({ 
    		filename: './logs/'+logFileName+"-%DATE%.log" ,
    		datePattern: 'YYYYMMDD',
    		// maxSize: '20m',
    		// maxFiles: '14d'
    		format: winston.format.combine(
    		    // winston.format.json()
    		    // winston.format.simple()
    			winston.format.printf(({ level, message }) => {
    			  // return `${level}: ${message}`;
    			   return `${level} [`+moment().format("YYYY-MM-DD HH:mm:ss:SSS")+`] ${message}`;
    			})
    		 )
    		// 
    	})
      ]
    });
    
    return logger;
}

module.exports = {
    name: "logger",
    initLogger: initLogger
};
