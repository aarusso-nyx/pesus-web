'use strict'

const db      = require('../dbmodels.js')
const jwt     = require('../jwt.js')

const _       = require('lodash')
const promise = require('promise')
const express = require('express')
const router  = express.Router()

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const blacklist = ['created_at', 'created_by']

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
if ( db.useAuth ) {
    router.use(jwt.validator);
    router.use(jwt.errorHandler);    
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
const model = function (p) {
    return _.extend(db.plain_models[p.models], { hasTimestamps: ['created_at'] })
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Fetch ALL <models>
router.get('/:models', function(req, res, next) {
    const m = model(req.params)
    const Model = db.bookshelf.Model.extend(m)
    new Model()
        .where(req.query)
        .fetchAll()
        .then(function(m){     
            res.status(200).jsonp( _.map(m.toJSON(), function(i) { 
                                    return _.omit(i,blacklist) 
                                }) )
        })
        .catch(function(e){
            res.status(404).jsonp(e)
        })
})

////////////////////////////////////////////////////
// Fetch One <model>
router.get('/:models/:model_id', function(req, res, next) {
    const m = model(req.params)
    req.params[m.idAttribute] = req.params.model_id

    const Model = db.bookshelf.Model.extend(m)
    new Model(_.omit(req.params, ['models', 'model_id']) )
        .fetch()
        .then(function(d){         
            res.status(200).jsonp(_.omit(d.toJSON(), blacklist))
        })
        .catch(function(e){
            res.status(404).jsonp(e)
        })
})

////////////////////////////////////////////////////
// Create a new <model> an returns its id 
router.post('/:models', function(req, res, next) {
    const m = model(req.params)
    const Model = db.bookshelf.Model.extend(m)
    new Model()
        .save(req.body)
        .then(function (d){
            const r = new Object
            r[m.idAttribute] = d.get(m.idAttribute)
            res.status(201).jsonp(r)
        })
        .catch(function(e){
            res.status(404).jsonp(e)
        })
})



////////////////////////////////////////////////////
// Update a model by its id and return it 
router.post('/:models/reorder', function(req, res, next) {    
    const m = model(req.params)
    if ( !m.orderAttribute ) {
        res.status(404)
    }

    const Model = db.bookshelf.Model.extend(m)
        
    const all = _.map ( req.body, q => {
        new Model( _.pick(q,m.idAttribute) )
            .save( _.pick(q,m.orderAttribute), { patch: true, method: 'update' })
    });
    
    promise.all(all)
        .then(function (data){
            res.status(201).jsonp(data)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        });
});



////////////////////////////////////////////////////
// Update a model by its id and return it 
router.put('/:models/:model_id', function(req, res, next) {
    const m = model(req.params)
    req.params[m.idAttribute] = req.params.model_id

    const Model = db.bookshelf.Model.extend(m)
    new Model(_.omit(req.params, ['models', 'model_id']) )
        .save(req.body, {patch: true})
        .then(function (d){
            res.status(204).jsonp(d)
        })
        .catch(function(e){
            res.status(404).jsonp(e)
        })
})

////////////////////////////////////////////////////
// Delete a <model> by its id
router.delete('/:models/:model_id', function(req, res, next) {
    const m = model(req.params)
    req.params[m.idAttribute] = req.params.model_id

    const Model = db.bookshelf.Model.extend(m)
    new Model( _.omit(req.params, ['models', 'model_id']) )
        .destroy()
        .then(function(d){         
            res.status(200).jsonp(d)
            })
        .catch(function(e){
            res.status(404).jsonp(e)
        })
})


////////////////////////////////////////////////////
module.exports = router
