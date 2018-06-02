import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,
         Subject    } from "rxjs";

import { Person, 
         Vessel, 
         Client     } from '../app.interfaces';
import { AppService } from '../app.service';
import { AuthService} from '../auth/auth.service';


@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    
    private client_id: number;
    
    private peopleSource = new Subject<Person[]>();
    private vesselSource = new Subject<Vessel[]>();

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( public http: HttpClient,
                 private app: AppService,
                 private auth: AuthService ) {
    
        this.auth.getClient().subscribe((c) => {
            this.client_id = c.client_id;
        })
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getClient() : Observable<Client> {
        return this.http.get<Client> ( this.app.uri(`/models/clients/${this.client_id}`) );
    }

    putClient(load) : Observable<Client> {
        return this.http.put<Client> ( this.app.uri(`/models/clients/${this.client_id}`), load );
    }    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getPeople() : Observable<Person[]> {
        return this.peopleSource.asObservable();
    }
    
    refreshPeople() {
        this.http.get<Person[]> ( this.app.uri(`/models/people?client_id=${this.client_id}`) )
            .subscribe((data) => this.peopleSource.next(data));
    };
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getVessels() : Observable<Vessel[]> {
        return this.vesselSource.asObservable();
    }
    
    refreshVessels() {
        this.http.get<Vessel[]> ( this.app.uri(`/models/vessels?client_id=${this.client_id}`) )
            .subscribe((data) => this.vesselSource.next(data));
    };    
        
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getModels(model) : Observable<any> {
        return this.http.get ( this.app.uri(`/models/${model}/`) );
    }
    
    getModel(model,id) : Observable<any> {
        return this.http.get ( this.app.uri(`/models/${model}/${id}`) );
    }
    
    delModel(model,id) : Observable<any> {
        return this.http.delete ( this.app.uri(`/models/${model}/${id}`) );
    }
    
    putModel(model,id,load) : Observable<any> {
        return this.http.put ( this.app.uri(`/models/${model}/${id}`), load );
    }
    
    postModel(model,load) : Observable<any> {
        return this.http.post ( this.app.uri(`/models/${model}/`), load );
    }
}