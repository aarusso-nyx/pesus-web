import { Injectable }       from '@angular/core';
import { ActivatedRouteSnapshot,
         CanActivate, 
         RouterStateSnapshot,
         Router }           from '@angular/router';

import { Observable,of } from "rxjs";
import { map, tap } from 'rxjs/operators';
import { AuthService }      from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor( private auth: AuthService, 
                 private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, 
                state: RouterStateSnapshot): Observable<boolean> {
        if ( !this.auth.isAuthenticated() ) {
            this.router.navigate(['/login']);
            return of(false);
        } else {
            if ( !route.data || !route.data.roles || route.data.roles.length == 0 )
                return of(true);
            
            return this.auth.policy
                        .pipe(map(p => route.data.roles.some( r => !!p.permissions && p.permissions.includes(r) )), 
                              tap(p => !!p || this.router.navigate(['/denied']) )             );
        }
    }
}