'use strict'

const db      = require('../dbmodels.js');
const bd      = require('../dbconn.js');
const jwt     = require('../jwt.js')

const _       = require('lodash');
const promise = require('promise');
const express = require('express');
const router  = express.Router();


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
if ( db.useAuth ) {
    router.use(jwt.validator);
    router.use(jwt.errorHandler);    
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL Vessels
router.get('/', function(req, res, next) {
    new db.Client()
        .where(req.query)
        .fetchAll({withRelated: ['devices']})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Fetch One Vessel
router.get('/:client_id', function(req, res, next) {
    new db.Client(req.params)
        .fetch({withRelated: ['devices', 
                              {'checks':qb => qb.orderBy('check_order', 'asc') }]})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Create a new Client
router.post('/', function(req, res, next) {
    new db.Client()
        .save(req.body)
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Update a Vessel
router.put('/:client_id', function(req, res, next) {
    new db.Client(req.params)
        .save(req.body, {patch: true})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Delete One Voyages
router.delete('/:client_id', function(req, res, next) {
    new db.Client(req.params)
        .destroy()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post('/:client_id/check/:check_id', function(req, res, next) {
        const val = [req.params.client_id, req.params.check_id];
        bd.knex.raw('INSERT INTO pesca.client_checktypes (client_id,check_id) VALUES (?,?) ON CONFLICT DO NOTHING', val)
        .then(function(data){         
            res.status(200).jsonp();
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
router.delete('/:client_id/check/:check_id', function(req, res, next) {
        const val = [req.params.client_id, req.params.check_id];
        bd.knex.raw('DELETE FROM pesca.client_checktypes WHERE (client_id,check_id)=(?,?)', val)
        .then(function(data){         
            res.status(200).jsonp(req.params)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

////////////////////////////////////////////////////
////////////////////////////////////////////////////
module.exports = router