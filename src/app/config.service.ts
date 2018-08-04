import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, timer,
         Subscription,
         BehaviorSubject,
         Subject    } from "rxjs";

import { filter, tap, 
         pluck, map } from 'rxjs/operators';

import { Person, Wind, Area,
         WindDir, Fish, 
         FishingType, 
         Vessel, 
         Client     } from '../app.interfaces';

import { AppService } from '../app.service';
import { AuthService} from '../auth/auth.service';


@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    private qs: string;
    private client_id: number;
    
    private peopleSource = new Subject<Person[]>();
    private Wind$ = new BehaviorSubject<Wind[]>([]);
    private WDir$ = new BehaviorSubject<WindDir[]>([]);
    private Fish$ = new BehaviorSubject<Fish[]>([]);
    private FTyp$ = new BehaviorSubject<FishingType[]>([]);
    private Area$ = new BehaviorSubject<Area[]>([]);

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private http: HttpClient,
                 private app:  AppService,
                 private auth: AuthService ) {
    
        this.clientId.subscribe((id) => {
            this.client_id = id;
            this.qs = id ? `?client_id=${id}` : '';
                    
            this.http.get<Wind[]> ( this.app.uri('/models/winds') )
                .subscribe(data => this.Wind$.next(data));

            this.http.get<WindDir[]> ( this.app.uri('/models/winddir') )
                .subscribe(data => this.WDir$.next(data));

            this.http.get<Fish[]> ( this.app.uri('/models/fishes') )
                .subscribe(data => this.Fish$.next(data));

            this.http.get<FishingType[]> ( this.app.uri('/models/fishingtypes') )
                .subscribe(data => this.FTyp$.next(data));        
        });
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    // Client Management
    get clientId() : Observable<number> {
        return this.auth.appdata.pipe( pluck('client'), pluck('client_id') );
    }
    
    get client() : Observable<Client> {
        return this.http.get<Client> ( this.app.uri(`/clients/${this.client_id}`) );
    }
    
    get clients() : Observable<Client[]> {
        return this.http.get<Client[]> ( this.app.uri(`/clients`) );
    }
    
    putClient(load) : Observable<Client> {
        return this.http.put<Client> ( this.app.uri(`/clients/${this.client_id}`), load );
    }    
    
    ///////////////////////////////////////////////////////////////////
    setClientCheck(v: number, c: number) : Observable<any> {
        return this.http.post ( this.app.uri(`/clients/${v}/check/${c}`), {});
    }

    delClientCheck(v: number, c: number) : Observable<any> {
        return this.http.delete ( this.app.uri(`/clients/${v}/check/${c}`) );
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get areas() : Observable<Area[]> {
        return this.http.get<Area[]> ( this.app.uri(`/areas`) );
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get vessels() :  Observable<Vessel[]> {
        return this.http.get<Vessel[]> ( this.app.uri(`/vessels`+this.qs) );    
    }
        
    getVessel(id) : Observable<any> {
        return this.http.get ( this.app.uri(`/vessels/${id}`) );
    }

    putVessel(id,load) : Observable<Vessel> {
        return this.http.put<Vessel> ( this.app.uri(`/vessels/${id}`), load );
    }


    ///////////////////////////////////////////////////////////////////
    setVesselPerm(v: number, p: number) : Observable<any> {
        return this.http.post ( this.app.uri(`/vessels/${v}/perm/${p}`), {});
    }

    delVesselPerm(v: number, p: number) : Observable<any> {
        return this.http.delete ( this.app.uri(`/vessels/${v}/perm/${p}`) );
    }

    ///////////////////////////////////////////////////////////////////
    setVesselCheck(v: number, c: number) : Observable<any> {
        return this.http.post ( this.app.uri(`/vessels/${v}/check/${c}`), {});
    }

    delVesselCheck(v: number, c: number) : Observable<any> {
        return this.http.delete ( this.app.uri(`/vessels/${v}/check/${c}`) );
    }
        
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getPeople() : Observable<Person[]> {
        return this.peopleSource.asObservable();
    }
    
    refreshPeople() {
        this.http.get<Person[]> ( this.app.uri(`/models/people`+this.qs) )
            .subscribe((data) => this.peopleSource.next(data));
    }
    
    getPerson(id) : Observable<any> {
        return this.http.get ( this.app.uri(`/models/people/${id}`) );
    }
    
    delPerson(id) : Observable<any> {
        return this.http.delete ( this.app.uri(`/models/people/${id}`) );
    }
    
    putPerson(id,load) : Observable<any> {
        return this.http.put ( this.app.uri(`/models/people/${id}`), load );
    }
    
    postPerson(load) : Observable<any> {
        return this.http.post ( this.app.uri(`/models/people/`), load );
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get fishes() :  Observable<Fish[]> {
        return this.Fish$.asObservable();
    }

    get fishingtypes() :  Observable<FishingType[]> {
        return this.FTyp$.asObservable();
    }

    get winds() :  Observable<Wind[]> {
        return this.Wind$.asObservable();
    }

    get winddirs() :  Observable<WindDir[]> {
        return this.WDir$.asObservable();
    }
}