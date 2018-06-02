import { Component } from '@angular/core';
import { AuthService   } from '../auth/auth.service';
import { AppService   } from '../app.service';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    template: '<mat-spinner style="margin: auto;"></mat-spinner>',
})
export class CallbackComponent {
    constructor( ) { }
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    constructor(public  auth: AuthService,
                public  app: AppService) { 
    
        this.app.setTitle('Login');
    }
}
