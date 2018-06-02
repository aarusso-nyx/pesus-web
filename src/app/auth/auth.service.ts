import * as auth0 from 'auth0-js';

import { Injectable         } from '@angular/core';
import { HttpClient, 
         HttpHeaders        } from '@angular/common/http';

import { Router             } from '@angular/router';

import { filter, flatMap, skipWhile    } from 'rxjs/operators';
import { Observable,  
         Subject, of, timer,
         BehaviorSubject    } from "rxjs";

import { environment } from '../../environments/environment';

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
@Injectable({
    providedIn: 'root',
})
export class AuthService {    
    private refreshSubscription: any;
    private usrClient:  BehaviorSubject<any> = new BehaviorSubject(JSON.parse(localStorage.getItem('client' )));
    private usrPolicy:  BehaviorSubject<any> = new BehaviorSubject(JSON.parse(localStorage.getItem('policy' )));
    private usrProfile: BehaviorSubject<any> = new BehaviorSubject(JSON.parse(localStorage.getItem('profile')));

    private logoff$ : Subject<boolean> = new Subject<boolean>();
    
    
    auth0 = new auth0.WebAuth({
        clientID: 'rcTVNP9Lwo04AnvEUL8XWpC5McEFALo5',
        domain: 'nyxk.auth0.com',
        responseType: 'token id_token',
        audience: 'urn:api:nyx:pesca',
        redirectUri: environment.redirectUri,
        scope: 'openid profile'
        });

    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private http: HttpClient, 
                 private router: Router ) { }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public login(): void {
        this.auth0.authorize();
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public logout(): void {
        // Remove tokens and expiry time from localStorage
        this.clearSession();

        // Go back to the home route
        this.router.navigate(['/login']);
    }
    
    
    public logoff(): Subject<boolean> {
        return this.logoff$;
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public getProfile(): BehaviorSubject<any> {
        return this.usrProfile;
    }    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public getPolicy(): BehaviorSubject<any> {
        return this.usrPolicy;        
    }  
            
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public getClient(): Observable<any> {
        return this.usrClient.pipe(skipWhile( x => !x ));        
    }  
        
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public handleAuthentication(): void {
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                this.setSession(authResult);
                this.router.navigate(['/map']);
            } else if (err) {
                this.clearSession;
                this.router.navigate(['/login']);
                this.logoff$.next(false);
                this.logoff$.complete();

            } else {    
                // Reloading, update Observables 
                const profile = JSON.parse(localStorage.getItem('profile'));
                profile ? this.usrProfile.next(profile) : this.logout();
                
                const policy = JSON.parse(localStorage.getItem('policy'));
                policy ? this.usrPolicy.next(policy) : this.logout();

                const client = JSON.parse(localStorage.getItem('client'));
                client ? this.usrClient.next(client) : this.logout();
            }
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public isAuthenticated(): boolean {
        // Check whether the current time is past the access token's expiry time
        const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return (new Date().getTime() < expiresAt);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public renewToken() {
        this.auth0.checkSession({}, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                this.setSession(result);
            }
        });
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public scheduleRenewal() {
        if(!this.isAuthenticated()) {
            this.clearSession;
            this.router.navigate(['/login']);
            
            return;
        } 
        
        this.unscheduleRenewal();

        const expiresAt = JSON.parse(window.localStorage.getItem('expires_at'));

        const source = of(expiresAt).pipe(flatMap(expiresAt => {
            const now = Date.now();

            // Use the delay in a timer to
            // run the refresh at the proper time
            return timer(Math.max(1, expiresAt - now));
            }) );

        // Once the delay time from above is
        // reached, get a new JWT and schedule
        // additional refreshes
        this.refreshSubscription = source.subscribe(() => {
            this.renewToken();
            this.scheduleRenewal();
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public unscheduleRenewal() {
        if(!this.refreshSubscription) 
            return;
        this.refreshSubscription.unsubscribe();
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private setSession(authResult): void {        
        // Set the time that the access token will expire at
        const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
        
        const self = this;
        this.auth0.client.userInfo(authResult.accessToken, (err, profile) => {
            if (err) { console.log(err); }
            
            localStorage.setItem('profile', JSON.stringify(profile) );
            self.usrProfile.next(profile);
        });
        
        const id = authResult.idTokenPayload;
        this.http.get (environment.baseURL+'/auth/'+id.sub +'/'+id.aud)
            .subscribe ( policy => {
                localStorage.setItem('policy', JSON.stringify(policy) );
                self.usrPolicy.next(policy);
            });
        
        this.http.get (environment.baseURL+'/sub/'+id.sub)
            .subscribe ( client => {
                localStorage.setItem('client', JSON.stringify(client) );
                self.usrClient.next(client); 
            });
        
        this.scheduleRenewal();
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private clearSession() : void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('profile');
        localStorage.removeItem('policy');
        localStorage.removeItem('client');
        
        this.usrProfile.next(null);
        this.usrPolicy.next(null);
    }    
}