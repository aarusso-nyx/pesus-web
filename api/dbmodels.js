'use strict'

const db = require ('./dbconn.js');

const sn = (process.env.PG_PESCA_SCHEMA || 'pesca') + '.';

const q = { useAuth: true };

q.plain_models = {
    addresses:       { tableName: sn+'addresses',       idAttribute: 'address_id' },
    alarmconditions: { tableName: sn+'alarmconditions', idAttribute: 'alarmcondition_id' },
    alarms:          { tableName: sn+'alarms',          idAttribute: 'alarm_id' },
    alarmtypes:      { tableName: sn+'alarmtypes',      idAttribute: 'alarmtype_id' },
    clients:         { tableName: sn+'clients',         idAttribute: 'client_id' },
    conditions:      { tableName: sn+'conditions',      idAttribute: 'condition_id' },
    domains:         { tableName: sn+'domains',         idAttribute: 'domain_id' },
    fishes:          { tableName: sn+'fishes',          idAttribute: 'fish_id' },
    fishingtypes:    { tableName: sn+'fishingtypes',    idAttribute: 'fishingtype_id' },
    geometries:      { tableName: sn+'geometries',      idAttribute: 'geometry_id' },
    lances:          { tableName: sn+'lances',          idAttribute: 'lance_id' },
    masters:         { tableName: sn+'masters',         idAttribute: 'person_id' },
    plans:           { tableName: sn+'plans',           idAttribute: 'plan_id' },
    people:          { tableName: sn+'people',          idAttribute: 'person_id' },
    severities:      { tableName: sn+'severities',      idAttribute: 'severity_id',    orderAttribute: 'severity_order'},
    vessels:         { tableName: sn+'vessels',         idAttribute: 'vessel_id' },
    voyages:         { tableName: sn+'voyages',         idAttribute: 'voyage_id' },
    winddir:         { tableName: sn+'winddir',         idAttribute: 'winddir_id' },
    winds:           { tableName: sn+'winds',           idAttribute: 'wind_id' },
};

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Views 
q.Seascape = db.Model.extend({tableName: sn+'seascape',
    client: function() { return this.belongsTo(q.Client, 'client_id')}, 
});


q.Path   = db.Model.extend({tableName: sn+'paths'});
q.Crew   = db.Model.extend({tableName: sn+'crew', idAttribute: 'person_id' });
q.Staff  = db.Model.extend({tableName: sn+'client_people', idAttribute: 'person_id' });
q.Address= db.Model.extend({tableName: sn+'addresses',     idAttribute: 'address_id' });

q.FType  = db.Model.extend({tableName: sn+'fishingtypes', idAttribute: 'fishingtype_id' });
q.VPerm  = db.Model.extend({tableName: sn+'vessel_perms'  });

q.Check  = db.Model.extend({tableName: sn+'checks', idAttribute: 'check_id' });
q.VChck  = db.Model.extend({tableName: sn+'vessel_checks' });
q.CChck  = db.Model.extend({tableName: sn+'client_checks' });

q.Vessel = db.Model.extend({tableName: sn+'vessels', idAttribute: 'vessel_id',
  checks: function() { return this.hasMany(q.VChck,  'vessel_id')},
   perms: function() { return this.hasMany(q.VPerm,  'vessel_id')},
  client: function() { return this.belongsTo(q.Client, 'client_id')}, 
});

q.People = db.Model.extend({tableName: sn+'people', idAttribute: 'person_id',
 address: function() { return this.belongsTo(q.Address,     'address_id')}, 
});

q.Client = db.Model.extend({tableName: sn+'clients',idAttribute: 'client_id',
 address: function() { return this.belongsTo(q.Address,'address_id')}, 
  checks: function() { return this.hasMany(q.CChck,  'client_id')},
 devices: function() { return this.hasMany(q.Vessel, 'client_id')},
   staff: function() { return this.hasMany(q.People, 'voyage_id').through(q.Staff,'person_id', 'zz')},                
});

q.Fish  = db.Model.extend({tableName: sn+'fishes',  idAttribute: 'fish_id'   });
q.Wind  = db.Model.extend({tableName: sn+'winds',   idAttribute: 'wind_id'   });
q.WDir  = db.Model.extend({tableName: sn+'winddir', idAttribute: 'winddir_id'});
q.Lance = db.Model.extend({tableName: sn+'lances',   idAttribute: 'lance_id', hasTimestamps: ['created_at'],
 winddir: function() { return this.belongsTo(q.WDir,     'winddir_id')}, 
    wind: function() { return this.belongsTo(q.Wind,     'wind_id')}, 
    fish: function() { return this.belongsTo(q.Fish,     'fish_id')}, 
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.Voyage = db.Model.extend({tableName: sn+'voyages', idAttribute: 'voyage_id', hasTimestamps: ['created_at'],
    crew: function() { return this.hasMany(q.People, 'voyage_id').through(q.Crew,'person_id', 'zz')},
  lances: function() { return this.hasMany(q.Lance,  'voyage_id')},
                            
  master: function() { return this.belongsTo(q.People,  'master_id' )}, 
  vessel: function() { return this.belongsTo(q.Vessel,  'vessel_id' )}, 

   ftype: function() { return this.belongsTo(q.FType,   'fishingtype_id')}, 
})
         
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.Geometry = db.Model.extend({tableName: sn+'geometries', idAttribute: 'geometry_id'});
q.Severity = db.Model.extend({tableName: sn+'severities', idAttribute: 'severity_id'});
q.Domain   = db.Model.extend({tableName: sn+'domains',    idAttribute: 'domain_id'  });
q.AlarmCond= db.Model.extend({tableName: sn+'alarmconditions', idAttribute: 'alarmcondition_id' });

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.AStatus  = db.Model.extend({tableName: sn+'status_alarms'});
q.VStatus  = db.Model.extend({tableName: sn+'status_vessels'});

q.ALog  = db.Model.extend ({ tableName: sn+'alerts_log', idAttribute: 'alarm_id'});

q.Alarm = db.Model.extend ({ tableName: sn+'alarms', idAttribute: 'alarm_id', 
     conditions: function() { return this.hasMany(q.Condition,  'alarm_id'      )},
         status: function() { return this.hasOne(q.AStatus,     'alarm_id'      )},
            ack: function() { return this.hasOne(q.Alert,     'alarm_id'      )},
          level: function() { return this.belongsTo(q.Severity, 'severity_id'   )},                               
         domain: function() { return this.belongsTo(q.Domain,   'domain_id'     )},                               
})

q.Condition = db.Model.extend ({ tableName: sn+'conditions', idAttribute: 'condition_id', 
          alarmtype: function() { return this.belongsTo(q.AlarmType, 'alarmtype_id' )},                               
})

q.AlarmType = db.Model.extend ({ tableName: sn+'alarmtypes', idAttribute: 'alarmtype_id',
    alarmconditions: function() { return this.belongsToMany(q.AlarmCond, sn+'alarmtype_conditions',
                                                      'alarmtype_id', 'alarmcondition_id')}
})

q.Alert = db.Model.extend({tableName: sn+'alerts', idAttribute: 'alarm_id',
         status: function() { return this.hasOne(q.AStatus, 'alarm_id' )},
})
                          
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
q.Store  = db.Model.extend({tableName: sn+'store',  idAttribute: 'store_id', hasTimestamps: ['created_at']})
q.Attach = db.Model.extend({tableName: sn+'attachs', idAttribute: 'store_id',
    file:  function() { return this.belongsTo(q.Store, 'store_id') },
});

module.exports = q;
