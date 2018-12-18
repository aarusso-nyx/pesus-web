'use strict'

const _       = require('lodash');
const promise = require('promise');
const express = require('express');
const router  = express.Router()

const request = require('request');
const storage = require('node-persist');

const baseURL = 'https://nyxk.auth0.com/api/v2';
const getTokenParams = {  method: 'POST',
                             url: 'https://nyxk.auth0.com/oauth/token',
                         headers: { 'content-type': 'application/json' },
                            body: '{ "client_id":"CJNGFEm0jmJ9EGm6s2w2JvxeEGPtGjTr",\
                                 "client_secret":"R5tnfyrYK29PmwdcKGSktnQqHn-wtzUd1HZEWXxXz2ATULfoQquEgmPzbMWPQEFa",\
                                 "audience":"https://nyxk.auth0.com/api/v2/","grant_type":"client_credentials"}' };

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
// Fetch ALL Users
router.get('/', function(req, res, next) {
    getToken('auth0')
        .then(function(authz){
            request({ method: 'GET', url: `${baseURL}/users`,
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
// Fetch One Users
router.get('/:user_id', function(req, res, next) {
    getToken('auth0')
        .then(function(authz){  // colocar o req.query
            request({ method: 'GET', url: `${baseURL}/users/${req.params.user_id}`,
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
// Patch One Users
router.put('/:user_id', function(req, res, next) {
    getToken('auth0')
        .then(function(authz){  // colocar o req.query
            request({ method: 'PATCH', url: `${baseURL}/users/${req.params.user_id}`,
                        body: JSON.stringify(req.body),
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

////////////////////////////////////////////////////
////////////////////////////////////////////////////
module.exports = router