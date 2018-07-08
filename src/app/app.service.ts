import { Injectable }   from '@angular/core';
import { ActivatedRoute, 
         RoutesRecognized,
         Router }        from '@angular/router';

import { Observable,  
         BehaviorSubject,
         Subject }      from "rxjs";

import { environment }  from '../environments/environment';


@Injectable({
    providedIn: 'root',
})
export class AppService {
    private titleSource = new Subject<string>();
    
    private sidenavStatus$ = new BehaviorSubject<boolean>(true);
    
    public last: string;
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    constructor(private router: Router) { }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    get sidenav_status() : Observable<boolean>  {
        return this.sidenavStatus$.asObservable();
    }
    
    sidenav_open() : void {
        this.sidenavStatus$.next(true);
    }
    
    sidenav_close() : void {
        this.sidenavStatus$.next(false);
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    uri ( t: string ) : string {
        return environment.baseURL+t;
    }
    
    set title(t: string) {
//        this.titleSource.next(t);
    }

    get title$() {
        return this.titleSource.asObservable();
    }
    
    back() {
        this.router.navigate([this.last || '.']);
    }
}