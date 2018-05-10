import { BrowserModule }            from '@angular/platform-browser';
import { NgModule }                 from '@angular/core';
import { ServiceWorkerModule }      from '@angular/service-worker';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';

import { ReactiveFormsModule,
         FormsModule }              from '@angular/forms';
import { HttpClientModule }         from '@angular/common/http';

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
         MatTooltipModule }         from '@angular/material';




import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { ConfigComponent        } from './config/config/config.component';
import { PeopleConfigComponent        } from './config/people/people.component';
import { PeopleDetailComponent        } from './config/people-detail/people-detail.component';
import { VesselConfigComponent        } from './config/vessel/vessel.component';
import { VesselDetailComponent        } from './config/vessel-detail/vessel-detail.component';
import { AlarmConfigComponent        } from './config/alarm/alarm.component';
import { AlarmDetailComponent        } from './config/alarm-detail/alarm-detail.component';
import { AreaConfigComponent        } from './config/area/area.component';
import { AreaDetailComponent        } from './config/area-detail/area-detail.component';
import { FishConfigComponent        } from './config/fish/fish.component';
import { FishDetailComponent        } from './config/fish-detail/fish-detail.component';
import { VoyagesComponent        } from './voyages/voyages/voyages.component';
import { MapComponent        } from './maps/map/map.component';

@NgModule({
  declarations: [
    AppComponent,
      ConfigComponent,
      PeopleConfigComponent,
      PeopleDetailComponent,
      VesselConfigComponent,
      VesselDetailComponent,
      AlarmConfigComponent,
      AlarmDetailComponent,
      AreaConfigComponent,
      AreaDetailComponent,
      FishConfigComponent,
      FishDetailComponent,
      VoyagesComponent,
      MapComponent,
      
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
      
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
