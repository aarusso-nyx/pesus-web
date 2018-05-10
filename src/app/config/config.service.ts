import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";

import { AppService } from '../app.service';
import { Aspect, Scale,
         Org, Severity,
         EventStatus,
         EventType }  from '../status/status.interfaces';


import { AllowGeo, 
         DTB_Municipio,
         DTB_Estado, 
         DTB_Macro, 
         DTB_Micro, 
         DTB_Meso   } from '../status/status.interfaces';



import { Twitter }    from '../media/media.interfaces';

import _pick from "lodash-es/pick";
import _omit from "lodash-es/omit";

@Injectable()
export class ConfigService {
    constructor( public http: HttpClient,
                 private app: AppService ) { }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getScales() : Observable<Scale[]> {
        return this.http.get<Scale[]> ( this.app.uri('/models/scales/') );
    } 

    putScale(addr,load) : Observable<Scale> {
        const fLoad = _pick (load, ['bgColor', 'fgColor', 'message']); 
        return this.http.put<Scale> ( this.app.uri('/models/scales/'+addr.grade), fLoad );
    }
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getSources() : Observable<Twitter[]> {
        return this.http.get<Twitter[]> ( this.app.uri('/models/twitter/') );
    } 

    putSource(addr,load) : Observable<Twitter> {
        const fLoad = _pick (load, ['screenName']); 
        return this.http.put<Twitter> ( this.app.uri('/models/twitter/'+addr.twitter_id), fLoad );
    }
    

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getSeverities() : Observable<Severity[]> {
        return this.http.get<Severity[]> ( this.app.uri('/models/severities/') );
    } 

    putSeverity(addr,load) : Observable<Severity> {
        const fLoad = _pick (load, ['bgColor', 'fgColor', 'message']); 
        return this.http.put<Severity> ( this.app.uri('/models/severities/'+addr.severity_id), fLoad );
    }
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getAspects() : Observable<Aspect[]> {
        return this.http.get<Aspect[]> ( this.app.uri('/models/aspects/') );
    }
    
    delAspect(addr) : Observable<Aspect> {
        return this.http.delete<Aspect> ( this.app.uri('/models/aspects/'+addr.aspect_id) );
    }
    
    putAspect(addr,load) : Observable<Aspect> {
        return this.http.put<Aspect> ( this.app.uri('/models/aspects/'+addr.aspect_id), load );
    }
    
    postAspect(load) : Observable<Aspect> {
        return this.http.post<Aspect> ( this.app.uri('/models/aspects/'), load );
    }
    
    reorderAspects(load) : Observable<Aspect> {
        return this.http.post<Aspect> ( this.app.uri('/models/aspects/reorder'), load );
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getOrgs() : Observable<Org[]> {
        return this.http.get<Org[]> ( this.app.uri('/models/org/') );
    }
    
    getOrg(addr) : Observable<Org> {
        return this.http.get<Org> ( this.app.uri('/models/org/'+addr.org_id) );
    }
    
    delOrg(addr) : Observable<Org> {
        return this.http.delete<Org> ( this.app.uri('/models/org/'+addr.org_id) );
    }
    
    putOrg(addr,load) : Observable<Org> {
        return this.http.put<Org> ( this.app.uri('/models/org/'+addr.org_id), load );
    }
    
    postOrg(load) : Observable<Org> {
        return this.http.post<Org> ( this.app.uri('/models/org/'), load );
    }
    
    reorderOrgs(load) : Observable<Org> {
        return this.http.post<Org> ( this.app.uri('/models/org/reorder'), load );
    }
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getEventTypes() : Observable<EventType[]> {
        return this.http.get<EventType[]> ( this.app.uri('/models/eventtypes/') );
    }
    
    delEventType(addr) : Observable<EventType> {
        return this.http.delete<EventType> ( this.app.uri('/models/eventtypes/'+addr.eventtype_id) );
    }
    
    putEventType(addr,load) : Observable<EventType> {
        return this.http.put<EventType> ( this.app.uri('/models/eventtypes/'+addr.eventtype_id), load );
    }
    
    postEventType(load) : Observable<EventType> {
        return this.http.post<EventType> ( this.app.uri('/models/eventtypes/'), load );
    }
            
    reorderEventTypes(load) : Observable<EventType> {
        return this.http.post<EventType> ( this.app.uri('/models/eventtypes/reorder'), load );
    }
        
 
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getEventStatii() : Observable<EventStatus[]> {
        return this.http.get<EventStatus[]> ( this.app.uri('/models/eventstatus/') );
    }
    
    delEventStatus(addr) : Observable<EventStatus> {
        return this.http.delete<EventStatus> ( this.app.uri('/models/eventstatus/'+addr.eventstatus_id) );
    }
    
    putEventStatus(addr,load) : Observable<EventStatus> {
        return this.http.put<EventStatus> ( this.app.uri('/models/eventstatus/'+addr.eventstatus_id), load );
    }
    
    postEventStatus(load) : Observable<EventStatus> {
        return this.http.post<EventStatus> ( this.app.uri('/models/eventstatus/'), load );
    }
            
    reorderEventStatii(load) : Observable<EventStatus> {
        return this.http.post<EventStatus> ( this.app.uri('/models/eventstatus/reorder'), load );
    }
        
 
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getAllowGeo(id) : Observable<AllowGeo[]> {
        return this.http.get<any[]> ( this.app.uri('/mapyx/allow/'+id.user_id) );
    }

    denyAllowGeo(id) : Observable<AllowGeo> {
        return this.http.delete<AllowGeo> ( this.app.uri('/mapyx/allow/'+id.user_id) );
    }

    saveAllowGeo(id,load) : Observable<AllowGeo> {
        return this.http.post<AllowGeo> ( this.app.uri('/mapyx/allow/'+id.user_id), load );
    }

    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getMacros() : Observable<DTB_Macro[]> {
        return this.http.get<DTB_Macro[]> ( this.app.uri('/mapyx/') );
    }
    
    getEstado(id) : Observable<DTB_Estado> {
        return this.http.get<DTB_Estado> ( this.app.uri('/mapyx/estado/'+id.ibge_id) );
    }
    
    getMunicipio(id) : Observable<DTB_Municipio> {
        return this.http.get<DTB_Municipio> ( this.app.uri('/mapyx/municipio/'+id.ibge_id) );
    }
    
}