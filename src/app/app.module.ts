import { BrowserModule }            from '@angular/platform-browser';
import { NgModule, 
         LOCALE_ID }                from '@angular/core';
import { ServiceWorkerModule }      from '@angular/service-worker';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';

import { ReactiveFormsModule,
         FormsModule }              from '@angular/forms';
import { HttpClientModule }         from '@angular/common/http';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// DateTime stuff
import { DatePipe }                 from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import localePtExtra from '@angular/common/locales/extra/pt';

registerLocaleData(localePt, 'pt', localePtExtra);

 import { OwlDateTimeModule, 
          OwlNativeDateTimeModule,
          OwlDateTimeIntl,
          OWL_DATE_TIME_LOCALE    } from 'ng-pick-datetime';

import { MomentModule } from 'ngx-moment';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
import { FlexLayoutModule }         from "@angular/flex-layout";
import { MatButtonModule, 
         MatButtonToggleModule, 
         MatCardModule,
         MatCheckboxModule,
         MatChipsModule,
         MatDatepickerModule,
         MatDialogModule, 
         MatExpansionModule,
         MatGridListModule,
         MatIconModule,
         MatInputModule,
         MatListModule,
         MatMenuModule,
         MatNativeDateModule,
         MatPaginatorModule,
         MatProgressBarModule,
         MatProgressSpinnerModule,
         MatRippleModule,
         MatSelectModule,
         MatSidenavModule,
         MatSlideToggleModule,
         MatSliderModule,
         MatSortModule,
         MatStepperModule,
         MatTableModule,
         MatTabsModule,
         MatToolbarModule,
         MatTooltipModule,
       MAT_DATE_LOCALE }         from '@angular/material';
import {ScrollDispatchModule} from '@angular/cdk/scrolling';

import { JwtModule } from '@auth0/angular-jwt';

export function tokenGetter() { 
    return localStorage.getItem('access_token');
}


import { environment           } from '../environments/environment';

import { AuthGuard             } from './auth/auth.guard';
import { AuthService           } from './auth/auth.service';
import { AuthDirective         } from './auth/auth.directive';
import { LoginComponent,
         DeniedComponent,
         PendingComponent,
         CallbackComponent     } from './auth/auth.component';

import { AppRoutingModule      } from './app-routing.module';
import { RootComponent         } from './root/root.component';
import { LatLonPipe, HeadToPipe} from './pipes/lat-lon.pipe';
import { MapsComponent, 
         MapDialog             } from './maps/maps.component';

import { ConfirmDialog         } from './dialogs/confirm.dialog';

import { VoyageEditComponent   } from './voyages/voyages.component';
import { VesselListComponent,
         VesselEditComponent   } from './vessel/vessel.component';
import { PeopleListComponent,
         PeopleEditComponent   } from './people/people.component';
import { UserListComponent,
         UserEditComponent     } from './users/user.component';
import { ClientListComponent,
         ClientEditComponent   } from './clients/client.component';


@NgModule({
  declarations: [
    RootComponent,
    LoginComponent,
    DeniedComponent,  
    PendingComponent,
    CallbackComponent,
    PeopleListComponent,
    PeopleEditComponent,
    VesselListComponent,
    VesselEditComponent,
    VoyageEditComponent,
    MapsComponent,
    MapDialog,
    LatLonPipe,
    HeadToPipe,
    AuthDirective,
    ConfirmDialog,
    UserListComponent,
    UserEditComponent,
    ClientListComponent,
    ClientEditComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MomentModule,
    MatButtonModule, 
    MatButtonToggleModule, 
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,  
    MatDialogModule, 
    MatExpansionModule,
    MatGridListModule,  
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,  
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatNativeDateModule, 
    MatRippleModule,
    ScrollDispatchModule,
    JwtModule.forRoot({
                config: {
                tokenGetter: tokenGetter,
                throwNoTokenError: true, 
                whitelistedDomains: [environment.baseHost]
                }
    }),

    OwlDateTimeModule, 
    OwlNativeDateTimeModule,
  ],
    
  entryComponents: [
    ConfirmDialog
  ],    
    
  providers: [
    { provide: LOCALE_ID, useValue: 'pt' },
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
    { provide: OWL_DATE_TIME_LOCALE, useValue: 'pt'},
      AuthService,
      AuthGuard,
      MapDialog,
      LatLonPipe,
      HeadToPipe,
      DatePipe,
  ],
  bootstrap: [RootComponent]
})
export class AppModule { }
