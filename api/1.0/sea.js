'use strict'

const db      = require('../dbmodels.js');
const jwt     = require('../jwt.js');
const _       = require('lodash');
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
router.get('/track/:vessel_id', function(req, res, next) {
    const t1 = req.query.t1 || (Date.now() / 1000);
    const t0 = req.query.t0 || (Date.now() / 1000) - 86400;
    
    const param = [req.params.vessel_id, Math.round(t0), Math.round(t1)];
    const qs = 'SELECT * FROM pesca.paths WHERE vessel_id=? AND tstamp BETWEEN SYMMETRIC ? AND ?';
    new db.knex.raw (qs, param)
        .then(function(data){
            res.status(200).jsonp( _.map (data.rows, (i) => [i.tstamp, i.lon, i.lat, i.vel, i.dir]) );
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/scape', function(req, res, next) {
    new db.Seascape()
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/scape/:client_id', function(req, res, next) {
    new db.Seascape()
        .where(req.params)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/fleethealth', function(req, res, next) {
    new db.FleetHealth()
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/fleethealth/:client_id', function(req, res, next) {
    new db.FleetHealth()
        .where(req.params)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
module.exports = router