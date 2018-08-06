import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard             } from './auth/auth.guard';
import { LoginComponent,
         DeniedComponent,
         PendingComponent,
         CallbackComponent     } from './auth/auth.component';

import { MapsComponent         } from './maps/maps.component';
import { VesselListComponent,
         VesselEditComponent   } from './vessel/vessel.component';
import { PeopleListComponent,
         PeopleEditComponent   } from './people/people.component';
import { VoyageEditComponent   } from './voyages/voyages.component';

import { UserListComponent,
         UserEditComponent     } from './users/user.component';
import { ClientListComponent,
         ClientEditComponent   } from './clients/client.component';

const routes: Routes = [
    {
        path: 'map',
        data: { roles: ['map:fleet', 'map:all'] },
        component: MapsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'staff',
        data: { roles: ['read:crew', 'edit:crew', 'create:crew', 'delete:crew'] },
        component: PeopleListComponent,
        canActivate: [AuthGuard],
        children: [{
            data: { roles: ['read:crew', 'edit:crew', 'create:crew', 'delete:crew'] },
            path: ':person_id',
            component: PeopleEditComponent
        }]
    },
    {
        path: 'vessels',
        data: { roles: ['read:vessel'] },
        component: VesselListComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'vessels/:vessel_id',
        data: { roles: ['read:vessel', 'edit:vessel'] },
        component: VesselEditComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'vessels/:vessel_id/voyage/:voyage_id',
        data: { roles: ['read:voyage', 'edit:voyage', 'create:voyage', 'delete:voyage'] },
        component: VoyageEditComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'clients',
        data: { roles: ['read:client', 'create:client', 'delete:client'] },
        canActivate: [AuthGuard],
        component: ClientListComponent,
    },
    {
        path: 'clients/:client_id',
        data: { roles: ['read:client', 'edit:client', 'create:client', 'delete:client'] },
        canActivate: [AuthGuard],
        component: ClientEditComponent,
    },
    {
        path: 'users',
        data: { roles: ['read:user'] },
        canActivate: [AuthGuard],
        component: UserListComponent,
    },
    {
        path: 'users/:user_id',
        data: { roles: ['read:user', 'edit:user'] },
        canActivate: [AuthGuard],
        component: UserEditComponent,
    },    
    {
        path: 'callback',
        component: CallbackComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'denied',
        component: DeniedComponent
    },    
    {
        path: 'pending',
        component: PendingComponent
    },    
    { path: '', component: LoginComponent, pathMatch: 'full' }, 
    { path: '**', redirectTo: '/' },        
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
