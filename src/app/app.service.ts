import { Injectable }   from '@angular/core';
import { Observable,  
         BehaviorSubject,
         Subject }      from "rxjs";

import { environment }  from '../environments/environment';


@Injectable({
    providedIn: 'root',
})
export class AppService {
    private titleSource = new Subject<string>();
    public  title$: Observable<string> = this.titleSource.asObservable();
    
    private tracks: number[] = [];
    private trackSource = new BehaviorSubject<number[]>([]);
     
    
    
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    constructor( ) { }

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    setTitle (t: string) {
        this.titleSource.next(t);
    }

    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getTracks() : Observable<number[]> {
        return this.trackSource.asObservable();
    }
    
    addTrack ( voyage_id: number ) {
        this.tracks.push(voyage_id);
        this.trackSource.next(this.tracks);
    }

    delTrack ( voyage_id: number ) {
        this.tracks.splice(this.tracks.indexOf(voyage_id), 1);
        this.trackSource.next(this.tracks);
    }
    
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    uri ( t: string ) : string {
        return environment.baseURL+t;
    }
}