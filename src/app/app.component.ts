import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, 
         BreakpointState,
         Breakpoints       } from '@angular/cdk/layout';

import { AuthService } from './auth/auth.service';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    profile: any;
    handset: boolean;
        
    constructor(private breakpointObserver: BreakpointObserver,
                public  auth:   AuthService) {
        auth.handleAuthentication();
        auth.scheduleRenewal();
    }

    ngOnInit() {
        this.breakpointObserver
            .observe(Breakpoints.Handset)
            .subscribe(p => this.handset = p.matches);

        this.auth.profile
            .subscribe(p => this.profile = p);
    }
}