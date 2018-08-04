import { Injectable  } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { Observable, Subscription,
         BehaviorSubject, timer,
         Subject       } from "rxjs";

import { ConfigService } from '../config/config.service';
import { AppService    } from '../app.service';
import { AuthService    } from '../auth/auth.service';
import { Voyage, Lance } from '../app.interfaces';


@Injectable({
    providedIn: 'root',
})
export class VoyageService {
    private blacklist : string[] = ['crew','lances', 'ftype', 'master', 'vessel'];
    private qs: string;
    private client_id: string;
    
    private timer: Subscription;
    private SeaScape$ = new BehaviorSubject<any[]>([]);
    private FleetHealth$ = new BehaviorSubject<any[]>([]);
    private voyageSource = new Subject<Voyage[]>();

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private  http: HttpClient,
                 private auth: AuthService,
                 private  app: AppService,
                 private config: ConfigService ) { 
        this.config.clientId
            .subscribe((id) => {
                this.auth.can('map:all')
                    .subscribe(mode => {
                        this.client_id = mode ? '' : id.toString();
                        this.qs        = mode ? '' : `?client_id=${id}`;
                    
                        // Subscribe to a 5min timer to refresh fleet map
                        this.timer = timer(0, 300000).subscribe((i) => {
                            this.http.get<any> ( this.app.uri(`/sea/scape/${this.client_id}`) )
                                .subscribe(s => this.SeaScape$.next(s));

                            this.http.get<any> ( this.app.uri(`/sea/fleethealth/${this.client_id}`) )
                                .subscribe(s => this.FleetHealth$.next(s));
                            
                            if ( !this.auth.isAuthenticated() ) {
                                this.timer.unsubscribe();
                            }
                        });        
                    });

            });        
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get seascape() : Observable<any> {
        return this.SeaScape$.asObservable();
    }
    
    get fleethealth() : Observable<any> {
        return this.FleetHealth$.asObservable();
    }
        
    getTrack(id) : Observable<any> {
        return this.http.get<any[]>(this.app.uri(`/sea/track/${id}`));
    }
        
    getZone(id) : Observable<any> {
        return this.http.get<any[]>(this.app.uri(`/areas/${id}`));
    }
        
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getVoyages() : Observable<Voyage[]> {
        return this.voyageSource.asObservable();
    }
    
    refreshVoyages() {
        this.http.get<Voyage[]> ( this.app.uri(`/voyages`+this.qs) )
            .subscribe((data) => this.voyageSource.next(data));
    };
    
    getVoyage(id: number) : Observable<Voyage> {
        return this.http.get<Voyage> ( this.app.uri(`/voyages/${id}`) );
    }
    
    delVoyage(id: number) : Observable<Voyage> {
        return this.http.delete ( this.app.uri(`/voyages/${id}`) );
    }
    
    putVoyage(id: number, load: Voyage) : Observable<Voyage> {
        return this.http.put ( this.app.uri(`/voyages/${id}`), load );
    }
    
    postVoyage(load: Voyage) : Observable<Voyage> {
        return this.http.post ( this.app.uri(`/voyages/`), load );
    }


    ///////////////////////////////////////////////////////////////////
    setCrew(v: number, p: number) : Observable<any> {
        return this.http.post ( this.app.uri(`/voyages/${v}/crew/${p}`), {});
    }

    delCrew(v: number, p: number) : Observable<any> {
        return this.http.delete ( this.app.uri(`/voyages/${v}/crew/${p}`) );
    }
    
    ///////////////////////////////////////////////////////////////////
    delLance(v: number, l: number) : Observable<any> {
        return this.http.delete ( this.app.uri(`/voyages/${v}/lance/${l}`) );
    }

    putLance(v: number, l: number, load: Lance) : Observable<any> {
        return this.http.put ( this.app.uri(`/voyages/${v}/lance/${l}`), load );
    }
    
    postLance(v: number, load: Lance) : Observable<any> {
        return this.http.post ( this.app.uri(`/voyages/${v}/lance`), load );
    }
}