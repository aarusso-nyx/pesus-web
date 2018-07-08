'use strict'

const db      = require('../dbconn.js')

const _       = require('lodash')
const express = require('express')
const router  = express.Router()

const promise = require('promise');
const request = require('request');
const storage = require('node-persist');


const baseURL = 'https://nyxk.us.webtask.io/adf6e2f2b84784b57522e3b19dfc9201/api';
const getTokenParams = {  method: 'POST',
                             url: 'https://nyxk.auth0.com/oauth/token',
                         headers: { 'content-type': 'application/json' },
                            body: '{ "client_id":"CJNGFEm0jmJ9EGm6s2w2JvxeEGPtGjTr",\
                                 "client_secret":"R5tnfyrYK29PmwdcKGSktnQqHn-wtzUd1HZEWXxXz2ATULfoQquEgmPzbMWPQEFa",\
                                 "audience":"urn:auth0-authz-api","grant_type":"client_credentials"}' };

storage.initSync({
    dir: '/tmp/.node-persist',
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
function getToken(key) {
    return new promise(function(resolve,reject){
        storage.getItem (key, function(err,authz){
                if ( authz ) {
                    resolve(authz);
                } else {
                    request(getTokenParams, function (err, resp, body){
                        if (err) {
                            reject(err);
                        } else {
                            const token = JSON.parse(body);
                            authz = token.token_type + ' ' + token.access_token;

                            storage.setItemSync(key, authz, {ttl: token.expires_in * 1000});
                            resolve(authz);
                        }
                    });    
                }
            });
    });
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL Roles
router.get('/', function(req, res, next) {
    getToken('authz')
        .then(function(authz){
            request({ method: 'GET', url: baseURL+'/roles',
                     headers: { 'content-type': 'application/json', 
                                'authorization': authz } }, 
                    function(err, resp, data) {
                                if (err) {
                                    res.status(404).jsonp(err);
                                } else {
                                    res.status(200).jsonp(JSON.parse(data));
                                }        
                    });
        })
        .catch(function(err){
            res.status(404)
        })
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch User
router.get('/:user_id/policy/:client_id', function(req, res, next) {
    getToken('authz')
        .then(function(authz){
            request({ method: 'POST', url: `${baseURL}/users/${req.params.user_id}/policy/${req.params.client_id}`,
                        body:'{ "connectionName": "Username-Password-Database" }', 
                     headers: { 'content-type': 'application/json', 
                                'authorization': authz } }, 
                    function(err, resp, data) {
                                if (err) {
                                    res.status(404).jsonp(err);
                                } else {
                                    res.status(200).jsonp(JSON.parse(data));
                                }        
                    });
        })
        .catch(function(err){
            res.status(404)
        })
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Remove a role from user - Note this is a POST due Angularis unable to handle 
// body on DELETE  
router.post('/:user_id', function(req, res, next) {
    getToken('authz')
        .then(function(authz){  // colocar o req.query
            request({ method: 'DELETE', url: `${baseURL}/users/${req.params.user_id}/roles`,
                        body: JSON.stringify(req.body),
                     headers: { 'content-type': 'application/json', 
                                'authorization': authz } }, 
                    function(err, resp, data) {
                console.log('aqui -');
                                if (err) {
                                    res.status(404).jsonp(err);
                                } else {
                                    res.status(200).jsonp({});
                                }        
                    });
        })
        .catch(function(err){
            res.status(404)
        })
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Patch One Users
router.put('/:user_id', function(req, res, next) {
    getToken('authz')
        .then(function(authz){  // colocar o req.query
            request({ method: 'PATCH', url: `${baseURL}/users/${req.params.user_id}/roles`,
                        body: JSON.stringify(req.body),
                     headers: { 'content-type': 'application/json', 
                                'authorization': authz } }, 
                    function(err, resp, data) {
                console.log('aqui +');
                                if (err) {
                                    res.status(404).jsonp(err);
                                } else {
                                    res.status(200).jsonp({});
                                }        
                    });
        })
        .catch(function(err){
            res.status(404)
        })
});
////////////////////////////////////////////////////
////////////////////////////////////////////////////
module.exports = router