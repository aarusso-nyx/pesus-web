'use strict'

const _			  = require('lodash');
const fs		  = require('fs');
const pg          = require('pg').native;
const path        = require('path');
const spdy        = require('spdy');
const chalk       = require('chalk');
const compression = require('compression');
const listRoutes  = require('express-list-routes');
const session     = require('express-session');
const pgSession   = require('connect-pg-simple')(session);
const history     = require('connect-history-api-fallback');

const express	  = require('express');
const morgan      = require('morgan');
const bodyParser  = require('body-parser');
const xmlParser = require('express-xml-bodyparser');

const options = require('./config.js');

// Configure Logging
const log = morgan(options.logFormat, { stream: options.logStream });

// Fix morgan HTTP/2 fail
morgan.token('http-version', function getHttpVersionToken(req){
    return req.isSpdy ? '2' : req.httpVersionMajor + '.' + req.httpVersionMinor
});

// Start express.js
const srv = express();
srv.use(compression());

srv.use(history({rewrites: [{ from: /^\/api.*$/,
                                to: c => c.parsedUrl.pathname }] } ));

// Set render engine to AUTH
srv.use(log);
console.log( chalk.bold.yellow('Starting %s'), chalk.bold.yellow(options.serverName) );

srv.use(bodyParser.json());
srv.use(bodyParser.urlencoded({extended: true}));
srv.use(xmlParser());

srv.use(session({saveUninitialized: false, 
                 secret: options.serverName, 
                 resave: false, 
                 store : new pgSession({ pg: pg, 
                                  tableName: 'sessions', 
                                 schemaName: 'auth', 
                                  conString: options.dbConn
                                       })
}));

// CORS
if ( options.cors ) {
    console.log( chalk.bold.yellow('CORS Enabled ') );

    srv.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS, POST, PUT, HEAD");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        next();
    });
}

srv.use(function(req, res, next) {
    res.header("Cache-Control", "no-cache");
    next();
});


// Auth
if ( options.auth ) {
    console.log( chalk.bold.yellow('Auth Enabled') );
}

// Serve Angular dist dir
const appDist = './app/dist';
if ( fs.existsSync(appDist) ) {
    srv.use('/', express.static(appDist, {maxAge: options.cacheAge} ));
}
 
// Serve API
const appAPI   = './api';
if ( !fs.existsSync(appAPI) ) {
    process.stdout.write(chalk.gray('none\n'));
} else {
    fs.readdirSync(appAPI)
        .filter ( (f) => fs.statSync(path.join(appAPI,f)).isDirectory() )
        .forEach(function(vers, i, allAPI){
            const last = ((i == (allAPI.length-1)) ? '\n' : ', ') ;
            process.stdout.write(chalk.cyan('v'+vers+last));

            fs.readdirSync(path.join(appAPI,vers)).forEach(function(r){
                const scrpt = path.basename(r,'.js');
                const route = path.join('/api',vers,scrpt);
                if ( r == scrpt )
                    return;

                const Router = require(path.join(__dirname,appAPI,vers,r)); 

                if ( options.printAPI ) {
                    listRoutes({ prefix: '=> '+route }, '\nAPI v'+vers+':\t'+scrpt, Router );
                }

                srv.use ( route, Router );
            })
        })
}

// printAPI
if ( options.printAPI ) {
    process.exit(0);
}

const appSrv = options.http2 ? spdy.createServer({
        ca: fs.readFileSync(options.certRoot+'/'+options.certFile.ca),
        key: fs.readFileSync(options.certRoot+'/'+options.certFile.key),
        cert: fs.readFileSync(options.certRoot+'/'+options.certFile.cert),
    }, srv) : srv;


// Run server
appSrv.listen(options.serverPort, function(err){
    if (err) {
        console.error(chalk.red(error));
        return process.exit(1);
    } else {
        console.log('Listening to %s at port TCP/%s', 
                        options.http2 ? chalk.bold('HTTPS') : chalk.gray('HTTP'),
                        options.serverPort);
    }
});
