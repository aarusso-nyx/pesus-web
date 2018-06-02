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
const format = function(data) {
    const blacklist = ['geom', 'geom_3857', 'geometry']

    return { 
        type: "Feature",
        geometry: JSON.parse(data.geometry),
        properties: _.omit (data, blacklist)
    };
}

const formatCollection = function(data) {
    return { 
        type: "FeatureCollection",
        features: _.map(data, format)
    };
}

const formatPoints = function(data) {
    const blacklist = ['geom', 'geometry', 'lat', 'lon']
    
    return { type: 'FeatureCollection', 
         features: _.map (data, function(s) {
            return {
                type: 'Feature',
                properties:  _.omit (s, blacklist),
                geometry:  { type: 'Point', coordinates: [Number(s.lon), Number(s.lat)] },
            }    
        })           
    }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.get('/', function(req, res, next) {
    new db.Geometry()
        .where(req.query)
        .fetchAll()
        .then(function(data){
            res.status(200).jsonp(formatCollection(data.toJSON()));
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
module.exports = router