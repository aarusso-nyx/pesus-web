import { Injectable }       from '@angular/core';
import { ActivatedRouteSnapshot,
         CanActivate, 
         RouterStateSnapshot,
         Router }           from '@angular/router';

import { AuthService }      from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    private client_id: number;
    private policy: any;
    
    constructor( private auth: AuthService, 
                 private router: Router) {
        auth.getPolicy().subscribe ( p => this.policy = p );
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;

        const isIn : boolean = this.auth.isAuthenticated();
        if ( !isIn ) {
           this.router.navigate(['/login']);
        }
        return isIn;
    }

}