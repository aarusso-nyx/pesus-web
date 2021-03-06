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

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
//// format 
/////////////////////////////////////////////////////////////////////////////////
const blacklist = ['geom', 'geom_3857', 'geom_4326', 'geometry', 'geom_geojson']
const format = function(data) {
    return { 
        type: "Feature",
        geometry: JSON.parse(data.geom_geojson),
        properties: _.omit (data, blacklist)
    };
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/', function(req, res, next) {
    new db.Geometry()
        .where(req.query)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(_.map(data.toJSON(), 
                g => _.pick(g,['geometry_id','geometry_name'])));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/:geometry_id', function(req, res, next) {
    new db.Geometry()
        .where(req.params)
        .fetch()
        .then(function(data){
            res.status(200).jsonp(format(data.toJSON()));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
module.exports = router