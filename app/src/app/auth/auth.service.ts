import * as auth0 from 'auth0-js';

import { Injectable         } from '@angular/core';
import { HttpClient, 
         HttpHeaders        } from '@angular/common/http';

import { Router             } from '@angular/router';

import { filter, pluck, 
         map, flatMap    } from 'rxjs/operators';
import { Observable, Subscription, Subject, 
         BehaviorSubject, of, timer } from "rxjs";

import { environment } from '../../environments/environment';

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private refreshSub: Subscription;
    private profile$:   BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private policy$:    BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private logoff$:    Subject<boolean> = new Subject<boolean>();
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private http: HttpClient, 
                 private router: Router ) { }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    auth0 = new auth0.WebAuth({
        clientID: environment.clientId,
        domain: 'nyxk.auth0.com',
        responseType: 'token id_token',
        audience: 'urn:api:nyx:pesca',
        redirectUri: environment.redirectUri,
        scope: 'openid update:current_user_metadata'
        });
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public get logoff(): Observable<boolean> {
        return this.logoff$.asObservable();    
    }
    
    public get profile(): Observable<any> {
        return this.profile$.asObservable()
                    .pipe(filter(x => !!x));
    }
    
    public get policy(): Observable<any> {
        return this.policy$.asObservable()
                    .pipe(filter(x => !!x));
    }
        
    public get appdata(): Observable<any> {
        return this.profile$.asObservable()
                    .pipe(filter(x => !!x), pluck('app_metadata'));
    }

    public get usrdata(): Observable<any> {
        return this.profile$.asObservable()
                    .pipe(filter(x => !!x), pluck('user_metadata'));
    }
    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public settings(load) : Observable<any> {
        return this.profile$
            .pipe(flatMap( p => this.http.put (environment.baseURL+`/users/${p.user_id}`, 
                                        { user_metadata: load} )));
    }

    public get appId(): string {
        return environment.clientId;
    }

    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public can(scope: string) : Observable<boolean> {
        return this.policy
                   .pipe(map(s => s && s.permissions.includes(scope)));
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public hasRole(role: string) : Observable<boolean> {
        return this.policy
                   .pipe(map(s => s && s.roles.includes(role)));
    }
    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public login() {
        this.auth0.authorize();
        this.logoff$.next(true);
        this.router.navigate(['/map']);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public logout() {
        // Remove tokens and expiry time from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('id_token');
        localStorage.removeItem('id_sub');
        localStorage.removeItem('id_aud');
        
        // Clean-up Subjects
        this.logoff$.next(false);
        this.profile$.next(null);
        this.policy$.next(null);
        
        
        // Unschedule Renewal 
        this.unscheduleRenewal();
        
        // Go back to the home route
        this.router.navigate(['/login']);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    // Check whether the current time is past the access token's expiry time
    public isAuthenticated(): boolean {
        const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return (new Date().getTime() < expiresAt);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public handleAuthentication() {
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {                
                window.location.hash = '';
                this.setSession(authResult);
                this.identify();
                this.router.navigate(['/map']);
            } else if (err) {
                this.logout();
            } else { /* Reloading */ 
                this.identify();
            }
        });
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    // Use the delay in a timer to run the refresh at the proper time
    // Once the delay time from above is reached, get a new JWT and 
    // schedule additional refreshes
    public scheduleRenewal() {
        if ( !this.isAuthenticated() ) {
            return;
        } 
        
        this.unscheduleRenewal();
        const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        this.refreshSub = of(expiresAt)
                            .pipe(flatMap(expiresAt => timer(Math.max(1, expiresAt - Date.now()))))
                            .subscribe(() => {
                                this.renewToken();
                                this.scheduleRenewal();
                            });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private unscheduleRenewal() {
        if( this.refreshSub ) 
            this.refreshSub.unsubscribe();
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private renewToken() {
        this.auth0.checkSession({}, (err, result) => {
            if (err) {
                this.logout();
            } else {
                this.setSession(result);
            }
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private setSession(authResult) {
        // Set the time that the access token will expire at
        const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('expires_at',   expiresAt);
        localStorage.setItem('id_token',     authResult.idToken);
        localStorage.setItem('id_sub',       authResult.idTokenPayload.sub);
        localStorage.setItem('id_aud',       authResult.idTokenPayload.aud);
        
        this.scheduleRenewal();
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private identify() {
        // profile 
        const sub = localStorage.getItem('id_sub');   
        this.http.get (environment.baseURL+`/users/${sub}`)
            .subscribe ( data => this.profile$.next(data) );
        
        // Policy
        const aud = localStorage.getItem('id_aud');   
        this.http.get (environment.baseURL+`/roles/${sub}/policy/${aud}`)
            .subscribe ( data => this.policy$.next(data) );
    }
}