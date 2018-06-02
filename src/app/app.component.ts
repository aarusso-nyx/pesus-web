import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';

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
    title: string;
    profile: any;

    
    isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);
    constructor(private breakpointObserver: BreakpointObserver,
                public  auth: AuthService,
                private app:   AppService ) {
        auth.handleAuthentication();
        auth.scheduleRenewal();
    }

    ngOnInit() {   
        this.auth.getProfile()
            .subscribe( p => this.profile = p);

        this.app.title$
            .subscribe( data => this.title = data );
    }
}
