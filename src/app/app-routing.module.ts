import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard             } from './auth/auth.guard';
import { LoginComponent,
         DeniedComponent,
         PendingComponent,
         CallbackComponent     } from './auth/auth.component';

import { MapsComponent         } from './maps/maps.component';
import { ClientComponent       } from './config/client/client.component';
import { VesselListComponent,
         VesselEditComponent   } from './config/vessel/vessel.component';
import { PeopleListComponent,
         PeopleEditComponent   } from './config/people/people.component';
import { VoyageListComponent,
         VoyageEditComponent   } from './voyages/voyages.component';

import { UserListComponent,
         UserEditComponent     } from './admin/users/user.component';
import { ClientListComponent,
         ClientEditComponent   } from './admin/clients/client.component';
import { DeviceListComponent,
         DeviceEditComponent   } from './admin/devices/device.component';

const routes: Routes = [
    {
        path: 'map',
        data: { roles: ['map:fleet', 'map:all'] },
        component: MapsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'profile',
        data: { roles: ['read:profile', 'edit:profile'] },        
        component: ClientComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'voyages',
        data: { roles: ['read:voyage', 'create:voyage', 'delete:voyage'] },
        component: VoyageListComponent,
        canActivate: [AuthGuard],
        children: [{
            path: ':voyage_id',
            data: { roles: ['read:voyage', 'edit:voyage', 'create:voyage', 'delete:voyage'] },
            component: VoyageEditComponent,
        }]
    },
    {
        path: 'crew',
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
        data: { roles: ['read:vessel', 'edit:vessel'] },
        component: VesselListComponent,
        canActivate: [AuthGuard],
        children: [{
        path: ':vessel_id',
         component: VesselEditComponent
        }]
    },
    {
        path: 'admin',
        children: [{
            path: 'clients',
            data: { roles: ['read:client', 'create:client', 'delete:client'] },
            canActivate: [AuthGuard],
            component: ClientListComponent,
            },{
            path: 'clients/:client_id',
            data: { roles: ['read:client', 'edit:client', 'create:client', 'delete:client'] },
            canActivate: [AuthGuard],
            component: ClientEditComponent,
            },{
            path: 'users',
            data: { roles: ['read:user'] },
            canActivate: [AuthGuard],
            component: UserListComponent,
            },{
            path: 'users/:user_id',
            data: { roles: ['read:user', 'edit:user'] },
            canActivate: [AuthGuard],
            component: UserEditComponent,
            },{
            path: 'devices',
            data: { roles: ['read:device', 'create:device', 'delete:device'] },
            canActivate: [AuthGuard],
            component: DeviceListComponent,
            },{
            path: 'devices/:vessel_id',
            data: { roles: ['read:device', 'edit:device', 'create:device', 'delete:device'] },
            canActivate: [AuthGuard],
            component: DeviceEditComponent,
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
