import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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

const routes: Routes = [
    {
        path: 'map',
        component: MapComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'voyages',
        component: VoyagesComponent
    },
    {
        path: 'config',
        component: ConfigComponent,
        children: [
            {
                path: 'people',
                component: PeopleConfigComponent,
                children: [{
                    path: ':person_id',
                    component: PeopleDetailComponent
                }]
            },
            {
                path: 'vessels',
                component: VesselConfigComponent,
                children: [{
                    path: ':vessel_id',
                    component: VesselDetailComponent
                }]
            },
            {
                path: 'areas',
                component: AreaConfigComponent,
                children: [{
                    path: ':area_id',
                    component: AreaDetailComponent
                }]
            },
            {
                path: 'fishes',
                component: FishConfigComponent,
                children: [{
                    path: ':fish_id',
                    component: FishDetailComponent
                }]
            },
            {
                path: 'alarms',
                component: AlarmConfigComponent,
                children: [{
                    path: ':alarm_id',
                    component: AlarmDetailComponent
                }]
            },
        ]
    },

//    {
//        path: 'callback',
//        component: CallbackComponent
//    },
//    {
//        path: 'profile',
//        component: ProfileComponent,
//        canActivate: [AuthGuard]
//    },
//    {
//        path: 'about',
//        component: AboutComponent
//    },
    
    { path: '', component: MapComponent, pathMatch: 'full' }, 
    { path: '**', redirectTo: '/' },        
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
