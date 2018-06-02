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
router.get('/track/:voyage_id', function(req, res, next) {
    new db.Path()
        .where(req.params)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp( _.map (data.toJSON(), (i) => [i.tstamp, i.lon, i.lat]) );
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