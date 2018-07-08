'use strict'

const db      = require('../dbmodels.js')
const jwt     = require('../jwt.js')
const _       = require('lodash')
const express = require('express')
const router  = express.Router()

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
if ( db.useAuth ) {
    router.use(jwt.validator);
    router.use(jwt.errorHandler);    
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/track/:vessel_id', function(req, res, next) {
    new db.Path()
        .where(req.params)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp( _.map (data.toJSON(), (i) => [i.tstamp, i.lon, i.lat, i.vel, i.dir]) );
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/scape', function(req, res, next) {
    new db.Seascape()
        .fetchAll({withRelated: ['client']})
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
module.exports = router