import { Component } from '@angular/core';
import { Router             } from '@angular/router';

import { AuthService   } from '../auth/auth.service';
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    template: '<mat-spinner style="margin: auto;"></mat-spinner>',
})
export class CallbackComponent {
    constructor( private router: Router ) { }
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./auth.component.css']
})
export class LoginComponent {
    constructor() { }
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './pending.component.html',
    styleUrls: ['./auth.component.css']
})
export class PendingComponent {
    constructor() { }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './denied.component.html',
    styleUrls: ['./auth.component.css']
})
export class DeniedComponent {
    constructor() { }
}