import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, timer,
         Subscription,
         BehaviorSubject,
         Subject    } from "rxjs";

import { filter, tap, 
         pluck, map } from 'rxjs/operators';

import { Person, Wind, Area,
         WindDir, Fish, Service,
         FishingType, Lance,
         Vessel, Voyage,
         Client, User    } from './app.interfaces';

import { AuthService} from './auth/auth.service';

import { environment as env }  from '../environments/environment';


@Injectable({
    providedIn: 'root',
})
export class ApiService {
    private blacklist : string[] = ['crew','lances', 'ftype', 'master', 'vessel'];

    private qs: string;
    private client_id: string;
    
    private timer: Subscription;
    
    private Wind$ = new BehaviorSubject<Wind[]>([]);
    private WDir$ = new BehaviorSubject<WindDir[]>([]);
    private Fish$ = new BehaviorSubject<Fish[]>([]);
    private FTyp$ = new BehaviorSubject<FishingType[]>([]);
    private Area$ = new BehaviorSubject<Area[]>([]);

    private User$ = new BehaviorSubject<User[]>([]);
    private Client$ = new BehaviorSubject<Client[]>([]);
    private People$ = new BehaviorSubject<Person[]>([]);

    private SeaScape$    = new BehaviorSubject<any[]>([]);
    private FleetHealth$ = new BehaviorSubject<any[]>([]);

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private http: HttpClient,
                 private auth: AuthService ) {
        this.clientId.subscribe((id) => {
            this.auth.can('map:all')
                .subscribe(mode => {
                    this.client_id = mode ? '' : id.toString();
                    this.qs        = mode ? '' : `?client_id=${id}`;

                    // Subscribe to a 5min timer to refresh fleet map
                    this.timer = timer(0, 300000).subscribe((i) => {
                        this.http.get<any> (env.baseURL+`/sea/scape/${this.client_id}`)
                            .subscribe(s => this.SeaScape$.next(s));

                        this.http.get<any> (env.baseURL+`/sea/fleethealth/${this.client_id}`)
                            .subscribe(s => this.FleetHealth$.next(s));

                        if ( !this.auth.isAuthenticated() ) {
                            this.timer.unsubscribe();
                        }
                    });        
                });
            
            // Static Data
            this.http.get<Wind[]> (env.baseURL+'/models/winds')
                .subscribe(data => this.Wind$.next(data));

            this.http.get<WindDir[]> (env.baseURL+'/models/winddir')
                .subscribe(data => this.WDir$.next(data));

            this.http.get<Fish[]> (env.baseURL+'/models/fishes')
                .subscribe(data => this.Fish$.next(data));

            this.http.get<FishingType[]> (env.baseURL+'/models/fishingtypes')
                .subscribe(data => this.FTyp$.next(data));  
            
            // Main models
            this.updateAreas();
            this.updateUsers();
            this.updatePeople();
            this.updateClients();
        });
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get areas() : Observable<Area[]> {
        return this.Area$.asObservable();
    }
        
    updateAreas() {
        this.http.get<Area[]> (env.baseURL+'/areas')
            .subscribe(data => this.Area$.next(data));  
    }

    getArea(id) : Observable<any> {
        return this.http.get<any[]>(env.baseURL+`/areas/${id}`);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get users() : Observable<User[]> {
        return this.User$.asObservable();
    }
    
    updateUsers() {
        this.http.get<User[]> (env.baseURL+`/users`)
            .subscribe(data => this.User$.next(data));  
    }
    
    getUser(id) : Observable<any> {
        return this.http.get (env.baseURL+`/users/${id}`);
    }
    
    putUser(id,load) : Observable<any> {
        return this.http.put (env.baseURL+`/users/${id}`, load );
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get roles() : Observable<any> {
         return this.http.get<any> (env.baseURL+`/roles`)
                    .pipe ( pluck('roles'), 
                            map ((x: any[]) => x.filter(z => z.applicationId == this.auth.appId) ),
                            map ((x: any[]) => x.sort((a,b) => a.description.localeCompare(b.description)) )
                          );
    }

    setRoles(id,load) : Observable<any> {
        return this.http.put (env.baseURL+`/roles/${id}`, load );
    }
    
    delRoles(id,load) : Observable<any> {
        return this.http.post (env.baseURL+`/roles/${id}`, load );
    }
    
    getPerms(id) : Observable<any> {
        return this.http.get (env.baseURL+`/roles/${id}/policy/${this.auth.appId}`);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    loadSettings() : Observable<any> {
        return this.auth.usrdata;
    }

    saveSettings(load) : Observable<any> {
        return this.auth.settings(load);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    // Client Management
    get clientId() : Observable<number> {
        return this.auth.appdata.pipe( pluck('client'), pluck('client_id') );
    }
 
    get clients() : Observable<Client[]> {
        return this.Client$.asObservable();
    }
        
    updateClients() {
        this.http.get<Client[]> (env.baseURL+`/clients`)
                .subscribe(data => this.Client$.next(data));  
    }
    
    getClient(id) : Observable<Client> {
        return this.http.get<Client> (env.baseURL+`/clients/${id}`);
    }
    
    delClient(id) : Observable<Client> {
        return this.http.delete<Client> (env.baseURL+`/clients/${id}`);
    }
    
    putClient(id,load) : Observable<Client> {
        return this.http.put<Client> (env.baseURL+`/clients/${id}`, load );
    }
    
    postClient(load) : Observable<Client> {
        return this.http.post<Client> (env.baseURL+`/clients/`, load );
    }    
    
    ///////////////////////////////////////////////////////////////////
    setClientCheck(v: number, c: number) : Observable<any> {
        return this.http.post (env.baseURL+`/clients/${v}/check/${c}`, {});
    }

    delClientCheck(v: number, c: number) : Observable<any> {
        return this.http.delete (env.baseURL+`/clients/${v}/check/${c}`);
    }

    ///////////////////////////////////////////////////////////////////
    setWantsWith(c: number, p: number) : Observable<any> {
        return this.http.post (env.baseURL+`/clients/${c}/workswith/${p}`, {});
    }

    delWantsWith(c: number, p: number) : Observable<any> {
        return this.http.delete (env.baseURL+`/clients/${c}/workswith/${p}`);
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get fleethealth() : Observable<any> {
        return this.FleetHealth$.asObservable();
    }

    get seascape() : Observable<any> {
        return this.SeaScape$.asObservable();
    }
        
    getTrack(id, min, max) : Observable<any> {
        let qs: string = '';
        if ( !!min && !!max ) {
            qs = `?t0=${min}&t1=${max}`;
        } else {
            if ( !!min ) {
                qs = `?t0=${min}`;
            }
            
            if ( !!max ) {
                qs = `?t1=${max}`;
            }
        }
        return this.http.get<any[]>(env.baseURL+`/sea/track/${id}${qs}`);
    }

    getVessel(id) : Observable<any> {
        return this.http.get (env.baseURL+`/vessels/${id}`);
    }

    putVessel(id,load) : Observable<Vessel> {
        return this.http.put<Vessel> ( env.baseURL+`/vessels/${id}`, load );
    }

    ///////////////////////////////////////////////////////////////////
    setVesselPerm(v: number, p: number) : Observable<any> {
        return this.http.post (env.baseURL+`/vessels/${v}/perm/${p}`, {});
    }

    delVesselPerm(v: number, p: number) : Observable<any> {
        return this.http.delete (env.baseURL+`/vessels/${v}/perm/${p}`);
    }

    ///////////////////////////////////////////////////////////////////
    setVesselCheck(v: number, c: number) : Observable<any> {
        return this.http.post (env.baseURL+`/vessels/${v}/check/${c}`, {});
    }

    delVesselCheck(v: number, c: number) : Observable<any> {
        return this.http.delete (env.baseURL+`/vessels/${v}/check/${c}`);
    }

        
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    postVesselService(v: number) : Observable<Service> {
        return this.http.post(env.baseURL+`/vessels/${v}/service`, {});
    }
    
    putVesselService(v: number) : Observable<Service> {
        return this.http.put(env.baseURL+`/vessels/${v}/service`, {});
    }
    

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get people() : Observable<Person[]> {
        return this.People$.asObservable();
    }
        
    updatePeople() {
        this.http.get<Person[]> (env.baseURL+`/people`)
                .subscribe(data => this.People$.next(data));  
    }

    getPerson(id) : Observable<Person> {
        return this.http.get<Person> (env.baseURL+`/people/${id}`);
    }
    
    delPerson(id) : Observable<Person> {
        return this.http.delete<Person> (env.baseURL+`/people/${id}`);
    }
    
    putPerson(id,load) : Observable<Person> {
        return this.http.put<Person> (env.baseURL+`/people/${id}`, load);
    }
    
    postPerson(load) : Observable<Person> {
        return this.http.post<Person> (env.baseURL+`/people/`, load);
    }
        
    ///////////////////////////////////////////////////////////////////
    setWorksWith(p: number, c: number) : Observable<any> {
        return this.http.post (env.baseURL+`/people/${p}/workswith/${c}`, {});
    }

    delWorksWith(p: number, c: number) : Observable<any> {
        return this.http.delete (env.baseURL+`/people/${p}/workswith/${c}`);
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////    
    getVoyage(id: number) : Observable<Voyage> {
        return this.http.get<Voyage> (env.baseURL+`/voyages/${id}`);
    }
    
    delVoyage(id: number) : Observable<Voyage> {
        return this.http.delete (env.baseURL+`/voyages/${id}`);
    }
    
    putVoyage(id: number, load: Voyage) : Observable<Voyage> {
        return this.http.put (env.baseURL+`/voyages/${id}`, load );
    }
    
    postVoyage(load: Voyage) : Observable<Voyage> {
        return this.http.post (env.baseURL+`/voyages/`, load );
    }

    ///////////////////////////////////////////////////////////////////
    setCrew(v: number, p: number) : Observable<any> {
        return this.http.post (env.baseURL+`/voyages/${v}/crew/${p}`, {});
    }

    delCrew(v: number, p: number) : Observable<any> {
        return this.http.delete (env.baseURL+`/voyages/${v}/crew/${p}`);
    }
    
    ///////////////////////////////////////////////////////////////////
    delLance(v: number, l: number) : Observable<any> {
        return this.http.delete (env.baseURL+`/voyages/${v}/lance/${l}`);
    }

    putLance(v: number, l: number, load: Lance) : Observable<any> {
        return this.http.put (env.baseURL+`/voyages/${v}/lance/${l}`, load);
    }
    
    postLance(v: number, load: Lance) : Observable<any> {
        return this.http.post (env.baseURL+`/voyages/${v}/lance`, load);
    }    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get fishes() : Observable<Fish[]> {
        return this.Fish$.asObservable();
    }

    get fishingtypes() : Observable<FishingType[]> {
        return this.FTyp$.asObservable();
    }

    get winds() : Observable<Wind[]> {
        return this.Wind$.asObservable();
    }

    get winddirs() : Observable<WindDir[]> {
        return this.WDir$.asObservable();
    }
}