import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { filter, pairwise, pluck } from 'rxjs/operators';
import { ActivatedRoute, 
         NavigationEnd,
         RoutesRecognized,
         Router }        from '@angular/router';
import { AppService    } from './app.service';
import { AuthService   } from './auth/auth.service';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title: Observable<string>;
    logged: boolean;
    profile: any;
    handset: boolean;
        
    constructor(private breakpointObserver: BreakpointObserver,
                private router: Router,
                private route:  ActivatedRoute,
                public  auth:   AuthService,
                public  app:    AppService ) {
        auth.handleAuthentication();
        auth.scheduleRenewal();
        
        this.title = this.app.title$;
    }

    ngOnInit() {
        // push every route change in localstorage
        this.router.events
            .pipe(filter((e: any) => e instanceof RoutesRecognized), pairwise() )
            .subscribe((e: any) => { // previous url
                this.app.last = e[0].urlAfterRedirects;
            });
        
        // Make sure sidenav is open
        this.router.events
            .pipe(filter((e: any) => e instanceof NavigationEnd), pairwise() )
            .subscribe((e: any) => { // previous url
                this.app.sidenav_open();
            });
                
        this.breakpointObserver
            .observe(Breakpoints.Handset)
            .subscribe(p => this.handset = p.matches);

//        this.app.title$
//            .subscribe(t => this.title = t);

        this.auth.profile
            .subscribe(p => this.profile = p);
        
        this.auth.logoff
            .subscribe(l => this.logged = l);
            
    }
}
