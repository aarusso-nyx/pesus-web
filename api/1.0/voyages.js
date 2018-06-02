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
// Fetch ALL Voyages
router.get('/', function(req, res, next) {
    new db.Voyage()
        .where(req.query)
        .query(qb => qb.orderBy('created_at', 'desc'))
        .fetchAll({withRelated: ['master', 'vessel', 'ftype']})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Fetch One Voyages
router.get('/:voyage_id', function(req, res, next) {
    new db.Voyage()
        .where(req.params)
        .fetch({withRelated: ['crew', 'lances', 
                              'master', 'vessel', 'ftype']})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


router.post('/', function(req, res, next) {
    new db.Voyage()
        .save(req.body)
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Fetch One Voyages
router.put('/:voyage_id', function(req, res, next) {
    new db.Voyage(req.params)
        .save(req.body, {patch: true})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Delete One Voyages
router.delete('/:voyage_id', function(req, res, next) {
    new db.Voyage(req.params)
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
// Create a new crew member of this voyage 
router.post('/:voyage_id/crew/:person_id', function(req, res, next) {
        const val = [req.params.voyage_id, req.params.person_id];
        bd.knex.raw('INSERT INTO pesca.crew (voyage_id,person_id) VALUES (?,?) ON CONFLICT DO NOTHING', val)
        .then(function(data){         
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
// Delete a crew member of this voyage
router.delete('/:voyage_id/crew/:person_id', function(req, res, next) {
    new db.Crew()
        .where(req.params)
        .destroy({required: false})
        .then(function(data){         
            res.status(200).jsonp(req.params)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL Voyage's Lances
router.get('/:voyage_id/lance', function(req, res, next) {
    new db.Lances()
        .where(req.params)
        .fetchAll({withRelated: ['fish', 'wind', 'winddir']})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});


////////////////////////////////////////////////////
// Create a new lance for this voyage 
router.post('/:voyage_id/lance', function(req, res, next) {
    new db.Lance()
        .save(req.body)
        .then(function(data){         
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
// Update a Lance
router.put('/:voyage_id/lance/:lance_id', function(req, res, next) {
    new db.Lance()
        .where(req.params)
        .save(req.body, {patch: true, method: 'update'})
        .then(function(data){         
            res.status(204).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
// Delete a lance
router.delete('/:voyage_id/lance/:lance_id', function(req, res, next) {
    new db.Lance(req.params)
        .destroy()
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