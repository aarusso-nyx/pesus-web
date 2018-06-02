 'use strict'

const db    = require('../dbmodels.js')
const _       = require('lodash')
const express = require('express')
const multer  = require('multer')

const router  = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage, limits: { fileSize: 30000000 }})

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
router.get('/:store_id', function(req, res, next) {
    new db.Store(req.params)
        .fetch()
        .then(function(data){
            // Send file back with mime headers
            const file = data.toJSON()
        
            res.setHeader('Content-disposition', 'attachment; filename=' + file.originalname);
            res.setHeader('Content-type', file.mimetype);
            res.setHeader('Content-length', file.size);
            res.setHeader('Content-encoding', file.encoding);

            res.status(200).send(new Buffer(file.buffer, 'base64'))
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        })                
})

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
router.delete('/:store_id', function(req, res, next) {
    new db.Store(req.params)
        .destroy()
        .then(function(data){
            res.status(200).jsonp(data.toJSON())               
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        })                
    })

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
router.post('/', upload.single('attach'), function(req, res, next) {    
    new db.Store()
        .save(req.file)
        .then(function (data){
            const store_id = _.pick(data.toJSON(), ['store_id', 'originalname'])
            res.status(201).jsonp(store_id)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        })    
    })

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
router.put('/attach-event', function(req, res, next) {
    new db.Attach()
        .save(req.body)
        .then(function (data){
            res.status(201).jsonp(data)
        })
        .catch(function(err){
            res.status(404).jsonp(err)
        })    
    })

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
module.exports = router