import { Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource,
         MatPaginator, 
         MatSort }       from '@angular/material';

import { ActivatedRoute, 
         Router }        from '@angular/router';

import { User, Client  } from '../app.interfaces';
import { ApiService    } from '../api.service';

import _sortBy from "lodash-es/sortBy";
import _pick   from "lodash-es/pick";

import { filter, pairwise } from 'rxjs/operators';

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './user-list.component.html',
    styleUrls: ['./user.component.css']
})
export class UserListComponent implements OnInit {
    @ViewChild(MatSort) sort: MatSort;
    
    users: MatTableDataSource<User>;
    cols: string[] = ['picture', 'email', 'username', 
                      'login_counts', 'last_login', 'client'];
    
    constructor( private api: ApiService) { }
    
    ngOnInit() {
        this.api.users
            .subscribe(data => { 
                this.users = new MatTableDataSource<User>(data);
                this.users.sort = this.sort; 
            });
    }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user.component.css']
})
export class UserEditComponent implements OnInit {
    ready:      boolean = false;    
    
    user:    User;
    clients: Client[];
    client_id: number;
    
    roles: any[];
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(private router: Router,
                private  route: ActivatedRoute,
                private    api: ApiService ) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private self = (data) => {        
        // Provide safe defaults 
        const noClient = { client_id: null, client_name: 'Aprovação Pendente' };
        data.app_metadata = data.app_metadata || { client: noClient };
        data.app_metadata.client = data.app_metadata.client || noClient;
        
        // Get data into this instance    
        this.user = data;
        this.client_id = data.app_metadata.client.client_id;
        
        this.api.clients
            .subscribe ( (clients) => { 
                this.clients = _sortBy(clients, 'client_name');
                this.clients.unshift(noClient);
            });        

        this.api.roles
            .subscribe ( (roles) => {
                this.ready = true;
                this.roles = roles.map(r => {
                                r.state = r.users.includes(this.user.user_id);
                                return r; });
            });
    }
        
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.route.params.subscribe( addr => {
            this.api.getUser(addr.user_id)
                .subscribe(this.self);
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    engage() {
        const client = this.clients.find(c => c.client_id == this.client_id);
        const load = { app_metadata: { client: _pick(client, ['client_id', 'client_name']) } };
        this.api.putUser(this.user.user_id, load)
            .subscribe(this.self);
    }  
        
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    change(evt,role_id) {
        if ( evt.checked ) {
            this.api.setRoles(this.user.user_id, [role_id]).subscribe();
        } else {
            this.api.delRoles(this.user.user_id, [role_id]).subscribe();
        }
    }
}