'use strict'

const db      = require('../dbmodels.js')
const bd      = require('../dbconn.js')
const jwt     = require('../jwt.js')

const _       = require('lodash')
const promise = require('promise')
const express = require('express')
const router  = express.Router()



const ORBCOMM_CUSTOMER_TOKEN = '3c691d72-b82d-3590-bfb4-32c4f014a9d9';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post('/:account', function(req, res, next){
    // Check Headers
//    const tokens = {};
//    req.headers['x-wsse']
//        .split(', ')
//        .forEach(l => {
//            let x = l.split(/=(.+)/);
//            x[1] = x[1].replace(/"/g,"");
//        
//            if ( x[0] == 'UsernameToken Username' ) {
//                tokens.username = x[1];
//            } else if ( x[0] == 'PasswordDigest' ) {
//                tokens.pwddgst = x[1];
//            } else if ( x[0] == 'Nonce' ) {
//                tokens.nonce =  x[1];
//            } else if ( x[0] == 'Created' ) {
//                tokens.created = new Date(x[1]);
//            }
//        });
//    
//    const check_wsse = function(tokens) {
//        if ( tokens.username !== ORBCOMM_CUSTOMER_TOKEN ) {
//            return false;
//        } else {
//            return true;  
//        }
//    };
//
//    if ( !check_wsse(tokens) ) {
//        res.status(401).jsonp();
//        return;
//    }
//    
    
    const isDup = (a,b) => (a.esn         === b.esn)    && 
                           (a.tstamp      === b.tstamp) &&
                           (a.messagetype === b.messagetype);
    
    const payload = req.body.messagelist.message.map ( (l) => {
        return {
            account:        req.params.account,
            esn:            l.esn[0],
            messagetype:    l.messagetype[0],
            messagedetail:  l.messagedetail[0],
            tstamp:         Number(l.timeingmtsecond[0]),
            lat:            Number(l.latitude[0]),
            lon:            Number(l.longitude[0])
        };
    })
    .filter((s1, pos, arr) => arr.findIndex(s2 => isDup(s1,s2)) === pos)
    .map(l => `('${l.account}','${l.esn}','${l.messagetype}','${l.messagedetail}',${l.tstamp},${l.lat},${l.lon})` )
    .join(',');
    
    const qs = 'INSERT INTO pesca.positions (account, esn, messagetype, messagedetail, tstamp, lat, lon) VALUES ' +
                payload + ' ON CONFLICT DO NOTHING;';
    
    bd.knex.raw(qs)
        .then(function(data){
            res.status(200).jsonp(data);
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        })
});

module.exports = router