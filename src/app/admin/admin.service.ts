import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { filter, 
         pluck, map } from 'rxjs/operators';
import { Observable,
         BehaviorSubject    } from "rxjs";

import { User, Device, 
         Client     } from './admin.interfaces';
import { AppService } from '../app.service';
import { AuthService } from '../auth/auth.service';


@Injectable({
    providedIn: 'root',
})
export class AdminService {
    private clientSource = new BehaviorSubject<Client[]>(null);
    private deviceSource = new BehaviorSubject<Device[]>(null);
    private peopleSource = new BehaviorSubject<User[]  >(null);

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private http: HttpClient,
                 private auth: AuthService,
                 private app:  AppService) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    get roles() : Observable<any> {
         return this.http.get<any> ( this.app.uri(`/roles`) )
                    .pipe ( pluck('roles'), 
                            map ((x: any[]) => x.filter(z => z.applicationId == this.auth.appId) ),
                            map ((x: any[]) => x.sort((a,b) => a.description.localeCompare(b.description)) )
                          );
    }
    
    get users() : Observable<User[]> {
         return this.http.get<User[]> ( this.app.uri(`/users`) )
    }
    
    get clients() : Observable<Client[]> {
         return this.http.get<Client[]> ( this.app.uri(`/clients`) )
    }
    
    get devices() : Observable<Device[]> {
         return this.http.get<Device[]> ( this.app.uri(`/vessels`) )
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getUsers(refresh: boolean = true) : Observable<User[]> {
        if ( refresh || this.peopleSource.getValue() == null) {
            this.http.get<User[]> ( this.app.uri(`/users`) )
                .subscribe((data) => this.peopleSource.next(data));
        }
        
        return this.peopleSource.asObservable();
    }

    getUser(id) : Observable<any> {
        return this.http.get ( this.app.uri(`/users/${id}`) );
    }
    
    putUser(id,load) : Observable<any> {
        return this.http.put ( this.app.uri(`/users/${id}`), load );
    }
    

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    setRoles(id,load) : Observable<any> {
        return this.http.put ( this.app.uri(`/roles/${id}`), load );
    }
    
    delRoles(id,load) : Observable<any> {
        return this.http.post ( this.app.uri(`/roles/${id}`), load );
    }
    
    getPerms(id) : Observable<any> {
        return this.http.get ( this.app.uri(`/roles/${id}/policy/${this.auth.appId}`) );
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getClients(refresh: boolean = true) : Observable<Client[]> {
        if ( refresh || this.clientSource.getValue() == null) {
            this.http.get<Client[]> ( this.app.uri(`/clients`) )
                .subscribe((data) => this.clientSource.next(data));
        }
        
        return this.clientSource.asObservable();
    }
    
    getClient(id) : Observable<any> {
        return this.http.get ( this.app.uri(`/clients/${id}`) );
    }
    
    delClient(id) : Observable<any> {
        return this.http.delete ( this.app.uri(`/clients/${id}`) );
    }
    
    putClient(id,load) : Observable<any> {
        return this.http.put ( this.app.uri(`/clients/${id}`), load );
    }
    
    postClient(load) : Observable<any> {
        return this.http.post ( this.app.uri(`  /clients/`), load );
    }

    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getDevices(refresh: boolean = true) : Observable<Device[]> {
        if ( refresh || this.deviceSource.getValue() == null) {
            this.http.get<Device[]> ( this.app.uri(`/vessels`) )
                .subscribe((data) => this.deviceSource.next(data));
        }

        return this.deviceSource.asObservable();
    }

    getDevice(id) : Observable<any> {
        return this.http.get ( this.app.uri(`/vessels/${id}`) );
    }
    
    delDevice(id) : Observable<any> {
        return this.http.delete ( this.app.uri(`/vessels/${id}`) );
    }
    
    putDevice(id,load) : Observable<any> {
        return this.http.put ( this.app.uri(`/vessels/${id}`), load );
    }
    
    postDevice(load) : Observable<any> {
        return this.http.post ( this.app.uri(`/vessels/`), load );
    }
}