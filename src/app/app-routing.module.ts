import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard             } from './auth/auth.guard';
import { LoginComponent,
         CallbackComponent     } from './auth/auth.component';

import { MapsComponent         } from './maps/maps.component';
import { ClientComponent       } from './config/client/client.component';
import { VesselListComponent,
         VesselEditComponent   } from './config/vessel/vessel.component';
import { PeopleListComponent,
         PeopleEditComponent   } from './config/people/people.component';
import { VoyageListComponent,
         VoyageEditComponent   } from './voyages/voyages.component';

const routes: Routes = [
    {
        path: 'map',
        component: MapsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'client',
        component: ClientComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'voyages',
        component: VoyageListComponent,
        canActivate: [AuthGuard],
        children: [{
            path: ':voyage_id',
            component: VoyageEditComponent,
        }]
    },
    {
        path: 'people',
        component: PeopleListComponent,
        canActivate: [AuthGuard],
        children: [{
            path: ':person_id',
            component: PeopleEditComponent
        }]
    },
    {
        path: 'vessels',
        component: VesselListComponent,
        canActivate: [AuthGuard],
        children: [{
            path: ':vessel_id',
            component: VesselEditComponent
        }]
    },
    {
        path: 'callback',
        component: CallbackComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },    
    { path: '', component: LoginComponent, pathMatch: 'full' }, 
    { path: '**', redirectTo: '/' },        
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
