import { enableProdMode, LOCALE_ID } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as moment from 'moment';
import { Auth0Lock } from 'auth0-lock';

import 'moment/locale/pt-br';
import 'hammerjs';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
    providers: [{provide: LOCALE_ID, useValue: 'pt' }]
}).catch(err => console.log(err));

moment.locale('pt-br');

// Initiating our Auth0Lock
new Auth0Lock( environment.clientId, 'nyxk.auth0.com', { language: 'pt-br' });    
