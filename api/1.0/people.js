'use strict'

const db      = require('../dbmodels.js');
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
// Fetch ALL Persons
router.get('/', function(req, res, next) {
    new db.People()
        .where(req.query)
        .fetchAll({withRelated: []})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Fetch One Vessel
router.get('/:person_id', function(req, res, next) {
    new db.People(req.params)
        .fetch({withRelated: [{'works': qb => qb
            .columns('clients.client_id', 'client_name', 'works' )
            .orderBy('client_name')
            }]
        })
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Create a new Person
router.post('/', function(req, res, next) {
    new db.People()
        .save(req.body)
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Update a Vessel
router.put('/:person_id', function(req, res, next) {
    new db.People(req.params)
        .save(req.body, {patch: true})
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

// Delete One Voyages
router.delete('/:person_id', function(req, res, next) {
    new db.People(req.params)
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
router.post('/:person_id/workswith/:client_id', function(req, res, next) {
        const val = [req.params.person_id, req.params.client_id];
        db.knex.raw('UPDATE pesca.client_people_star SET works=TRUE WHERE (person_id,client_id)=(?,?)', val)
        .then(function(data){         
            res.status(200).jsonp(req.params);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });
});

////////////////////////////////////////////////////
router.delete('/:person_id/workswith/:client_id', function(req, res, next) {
        const val = [req.params.person_id, req.params.client_id];
        db.knex.raw('UPDATE pesca.client_people_star SET works=FALSE WHERE (person_id,client_id)=(?,?)', val)
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