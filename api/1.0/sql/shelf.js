               withRelated: [{
                   'capital':    function(qb) { qb.column('ibge_id', 'toponimia' ) },
                   'macro':      function(qb) { qb.column('ibge_id', 'toponimia', 'sigla') },
                   'meso':       function(qb) { qb.column('ibge_id', 'toponimia', 'estado_id').orderBy('toponimia') },
                   'meso.munis': function(qb) { qb.column('ibge_id', 'toponimia', 'meso_id').orderBy('toponimia') },
             }] })
             
             
             
             
             ///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.post('/:org_id/:aspect_id', function(req, res, next) {
    new db.Grade()
        .where(req.params)
        .destroy()
        .then(function(){
            const load = _.extend ( {}, req.body, req.params )
            new db.Grade()
                .save(load)
                .then(function(data){
                new db.Status(req.params)
                    .fetch()
                    .then(function(){
                        res.status(200).jsonp();
                    })
                    .catch(function(err){
                        res.status(404).jsonp(err);
                    });
                })
                .catch(function(data){
                    res.status(404).jsonp(err);
                });
        
        })
        .catch(function(err){
            res.status(404).jsonp(err);
        });    
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
router.delete('/:org_id/:aspect_id', function(req, res, next) {
    new db.Grade()
        .where(req.params)
        .destroy()
        .then(function(data){
            res.status(200).jsonp(req.params)
        })
        .catch(function(e){
            res.status(404).jsonp(e)
        })
});
