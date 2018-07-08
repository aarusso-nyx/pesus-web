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
    new db.Vessel()
        .where(req.query)
        .fetchAll({withRelated: ['client']})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Fetch One Vessel
router.get('/:vessel_id', function(req, res, next) {
    new db.Vessel(req.params)
        .fetch({withRelated: [{'perms': qb => qb.orderBy('fishingtype_desc', 'asc') },
                              {'checks':qb => qb.orderBy('check_order', 'asc') }]})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Create a new Vessel
router.post('/', function(req, res, next) {
    new db.Vessel()
        .save(req.body)
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Update a Vessel
router.put('/:vessel_id', function(req, res, next) {
    new db.Vessel(req.params)
        .save(req.body, {patch: true})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Delete One Voyages
router.delete('/:vessel_id', function(req, res, next) {
    new db.Vessel(req.params)
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
router.post('/:vessel_id/perm/:fishingtype_id', function(req, res, next) {
        const val = [req.params.vessel_id, req.params.fishingtype_id];
        bd.knex.raw('INSERT INTO pesca.vessel_fishingtypes (vessel_id,fishingtype_id) VALUES (?,?) ON CONFLICT DO NOTHING', val)
        .then(function(data){         
            res.status(200).jsonp();
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
router.delete('/:vessel_id/perm/:fishingtype_id', function(req, res, next) {
        const val = [req.params.vessel_id, req.params.fishingtype_id];
        bd.knex.raw('DELETE FROM pesca.vessel_fishingtypes WHERE (vessel_id,fishingtype_id)=(?,?)', val)
        .then(function(data){         
            res.status(200).jsonp(req.params)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post('/:vessel_id/check/:check_id', function(req, res, next) {
        const val = [req.params.vessel_id, req.params.check_id];
        bd.knex.raw('INSERT INTO pesca.vessel_checktypes (vessel_id,check_id) VALUES (?,?) ON CONFLICT DO NOTHING', val)
        .then(function(data){         
            res.status(200).jsonp();
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
router.delete('/:vessel_id/check/:check_id', function(req, res, next) {
        const val = [req.params.vessel_id, req.params.check_id];
        bd.knex.raw('DELETE FROM pesca.vessel_checktypes WHERE (vessel_id,check_id)=(?,?)', val)
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