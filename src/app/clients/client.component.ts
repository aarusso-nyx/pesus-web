import { Component, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute, 
         Router }        from '@angular/router';
import { FormBuilder,
         FormGroup,
         Validators    } from '@angular/forms';
import { MatDialog, 
         MatDialogRef, 
         MatTableDataSource,
         MatPaginator, 
         MatSort,
         MAT_DIALOG_DATA }  from '@angular/material';

import { Observable,of } from "rxjs";

import { Client, User, Person,
         Status, Vessel        } from '../app.interfaces';
import { ApiService    } from '../api.service';
import { AuthService   } from '../auth/auth.service';
import { ConfirmDialog } from '../dialogs/confirm.dialog';

import _omit        from "lodash-es/omit";
import _sortBy      from "lodash-es/sortBy";
import _countBy     from "lodash-es/countBy";

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './client-list.component.html',
    styleUrls: ['./client.component.css']
})
export class ClientListComponent implements OnInit {
    @ViewChild(MatSort) sort: MatSort;
    clients: MatTableDataSource<Client>;
    cols: string[] = ['client_name', 'users', 'devices',
                      'fleet', 'sail', 'dock', 'miss', 'lost'];
    total: Status;
    
    constructor(private api:  ApiService) { }

    ngOnInit() {
        this.api.clients
            .subscribe (clients => {
                if ( !clients ) return;
                
                this.total = {
                    fleet: 0,
                    miss:  0,
                    lost:  0,
                    dock:  0,
                    sail:  0
                };

                clients.forEach(c => {
                    this.total.fleet += Number(c.status.fleet || 0);                    
                    this.total.miss  += Number(c.status.miss  || 0);                    
                    this.total.lost  += Number(c.status.lost  || 0);                    
                    this.total.dock  += Number(c.status.dock  || 0);                    
                    this.total.sail  += Number(c.status.sail  || 0);                    
                })
            
                this.api.users
                    .subscribe(users => { 
                        clients.forEach(c => {
                            c.users = _countBy (users, 
                                (u) => u.app_metadata && u.app_metadata.client.client_id == c.client_id);
                        })
                    
                    
                        this.clients = _sortBy(clients, 'client_name');
                        this.clients.sort = this.sort;
                    });
            });
    }
    
    
    public style(v) {
        if ( v.lost > 0 ) {
            return 'lost'; 
        } else if ( v.miss > 0 ) {
            return 'miss'; 
        } else {
            return 'seen'; 
        }
    }  
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
  templateUrl: './client-edit.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientEditComponent implements OnInit {
    @ViewChild(MatSort) devices_sort: MatSort;
    @ViewChild(MatSort)   users_sort: MatSort;
//    @ViewChild(MatSort)   staff_sort: MatSort;

    id:     number;
    fresh:  boolean = false;
    ready:  boolean = false;
    
    client: Client;
    form: FormGroup;

    users: MatTableDataSource<User>;
    users_cols: string[] = ['picture', 'email', 'username', 
                            'login_counts', 'last_login'];

    devices: MatTableDataSource<any>;
    devices_cols: string[] = ['esn', 'vessel_name', 'status', 'since'];
    
//    staff: MatTableDataSource<Person>;
//    staff_cols: string[] = ['picture', 'person_name', 'birthday'];

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(private api:    ApiService,
                private dialog: MatDialog,
                private fb:     FormBuilder,
                private route:  ActivatedRoute,
                private router: Router) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        // Create Form Group
        this.form = this.fb.group({
            client_id:        '',
            client_name:     ['', Validators.required],
            cnpj:            ['', Validators.required],
        });
        this.form.disable();

        this.route.params.subscribe( addr => {
            let obs: Observable<Client>;
            
            if ( addr.client_id === 'new') {
                obs = of({client_id: undefined, client_name: undefined});
            } else {
                obs = this.api.getClient(addr.client_id);
            }
            
            obs.subscribe( (client) => {
                    if ( !client )  return; 
                
                    this.api.users
                        .subscribe(users => {
                            if ( !users )  return; 
                        
                            const belong = u => u.app_metadata && (u.app_metadata.client.client_id == client.client_id);
                        
                            this.users = new MatTableDataSource<User>(users.filter(belong));
                            this.users.sort = this.users_sort; 
    
                            this.devices = new MatTableDataSource<Vessel>(client.devices);
                            this.devices.sort = this.devices_sort;
                        
//                            this.staff = new MatTableDataSource<Person>(client.staff);
//                            this.staff.sort = this.staff_sort; 
                        
                            this.ready  = true;
                            this.client = client;
                            this.form.reset(this.client);
                            this.fresh = (this.client.client_id == undefined);
                            this.fresh ? this.form.enable() : 
                                         this.form.disable();
                        });
                });
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    edit() {
        this.form.enable();
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    drop() {
        if ( this.fresh ) {
            this.router.navigate(['../'], { relativeTo: this.route });
        } else {
            this.form.reset(this.client);
            this.form.disable();
        }
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    save() {
        const id = this.client.client_id;
        const load = _omit(this.form.value, 'client_id');
        
        if ( this.fresh ) {
            this.api.postClient(load)
                .subscribe((data) => { 
                    this.client = data; 
                    this.form.reset(this.client);
                    this.form.disable();
                    this.api.updateClients();
                    this.router.navigate([`../${data.client_id}`], { relativeTo: this.route });

                });
        } else {
            this.api.putClient(id, load)
                .subscribe((data) => { 
                    this.client = this.form.value;
                    this.form.reset(this.client);
                    this.form.disable();
                    this.api.updateClients();
                });
        }
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    checks(evt) {
        const v = evt.option.value;
        if ( evt.option.selected ) {
            this.api.setClientCheck(v.client_id, v.check_id)
                .subscribe();
        } else {
            this.api.delClientCheck(v.client_id, v.check_id)
                .subscribe();
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    like(p: any) {
        this.api.setWantsWith(this.client.client_id, p.person_id)
            .subscribe(() => p.wants);
    }
    
    unlike(p: any) {
        this.api.delWantsWith(this.client.client_id, p.person_id)
            .subscribe(() => p.wants);
    }    
    
     ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {  
    }
}