import { Injectable  } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { Observable,
         Subject     } from "rxjs";
import { AppService  } from '../app.service';
import { AuthService } from '../auth/auth.service';

import { Voyage, Lance } from '../app.interfaces';


@Injectable({
    providedIn: 'root',
})
export class VoyageService {
    private blacklist : string[] = ['crew','lances', 'ftype', 'master', 'vessel'];
    private client_id: number;
    private voyageSource = new Subject<Voyage[]>();

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
    getVoyages() : Observable<Voyage[]> {
        return this.voyageSource.asObservable();
    }
    
    refreshVoyages() {
        this.http.get<Voyage[]> ( this.app.uri(`/voyages?client_id=${this.client_id}`) )
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