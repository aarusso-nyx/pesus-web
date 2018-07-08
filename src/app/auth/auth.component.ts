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
    constructor(public  app: AppService) { 
        this.app.title = 'Login';
    }
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './pending.component.html',
    styleUrls: ['./pending.component.css']
})
export class PendingComponent {
    constructor(public  app: AppService) { 
        this.app.title = 'Aguardando Aceitação';
    }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './denied.component.html',
    styleUrls: ['./denied.component.css']
})
export class DeniedComponent {
    constructor(public  app: AppService) { 
        this.app.title = 'Acesso Negado';
    }
}