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

import { Client, User, Status } from '../admin.interfaces';
import { AdminService  } from '../admin.service';
import { ConfirmDialog } from '../../dialogs/confirm.dialog';
import { AuthService   } from '../../auth/auth.service';
import { AppService    } from '../../app.service';

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
    
    constructor( private app:    AppService,
                 private admin:  AdminService) { }

    ngOnInit() {
        this.app.title = 'Painel de Clientes';      
                
        this.admin.getClients()
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
            
                this.admin.getUsers(false)
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
    id:     number;
    fresh:  boolean = false;
    ready:  boolean = false;
    
    client: Client;
    form: FormGroup;
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( public app:    AppService,
                 public dialog: MatDialog,
                private fb:     FormBuilder,
                private route:  ActivatedRoute,
                private router: Router,
                private admin: AdminService) { }

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
                obs = this.admin.getClient(addr.client_id);
            }
            
            obs.subscribe( (client) => {
                    if ( !client )  return; 
                    this.admin.getUsers(false)
                        .subscribe(users => {
                            if ( !users )  return; 
                        
                            const belong = u => u.app_metadata && (u.app_metadata.client.client_id == client.client_id);
                        
                            client.users = users.filter (belong);
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
            this.admin.postClient(load)
                .subscribe((data) => { 
                    this.client = data; 
                    this.form.reset(this.client);
                    this.form.disable();
                    this.admin.getClients();
                    this.router.navigate([`../${data.client_id}`], { relativeTo: this.route });

                });
        } else {
            this.admin.putClient(id, load)
                .subscribe((data) => { 
                    this.client = this.form.value;
                    this.form.reset(this.client);
                    this.form.disable();
                    this.admin.getClients();
                });
        }
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {
        
    }
}