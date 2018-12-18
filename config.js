'use strict'

const getopt = require('node-getopt-long');
const url    = require('url');

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const defaults = {
    serverPort  :  4040,
    serverName  : 'inkas - NYX Knowledge Application Server', 	    
    copyright   : 'Copyright 2015 (c) Antonio A. Russo',
    logFormat   : 'combined',
    auth        : false,
    cors        : false,
    http2       : false,
    printAPI    : false,
    verbose     : false,
    certRoot    : process.env.SSL_DIR,
    certFile    : { ca:     'chain.pem',
                    key:    'privkey.pem',
                    cert:   'fullchain.pem' }
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const options =  getopt.configure([
	['printAPI|a!',         { description: 'Print out ALL exposed API mountpaths' }],
	['http2!',              { description: 'Enable HTTP/2 (default)' }],
	['cors!',               { description: 'Enable CORS' }],
	['auth!',               { description: 'Enable Auth' }],
	['verbose|v',           { description: 'Be verbose' }],
	['serverPort|port|p=i', { description: 'TCP Port',          on:     parseInt }],
	['cacheAge|t=i',        { description: 'HTTP Cache maxAge', on:     parseInt }],
	['logFormat|F=s',       { description: 'LogFormat',         test:   ['dev', 'combined', 'common', 'short', 'tiny'] }] ],
	{ name        : 'inkas',
	commandVersion: 3.1,
	helpPrefix    : defaults.serverName,
	helpPostfix   : defaults.copyright,	
	defaults      : defaults }).process();

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
console.log(process.env);

options.pgConn = {
	user:     process.env.PG_USER,
	host:     process.env.PG_HOST,
	database: process.env.PG_DB,
    password: process.env.PG_PASS,
};

options.knex = require('knex')({client: 'pg', connection: options.pgConn, debug: false });
module.exports = options;