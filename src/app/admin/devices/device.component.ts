import { Component, OnInit, ViewChild } from '@angular/core';
//import { Location } from '@angular/common';

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

import { Device, Client } from '../admin.interfaces';
import { AdminService  } from '../admin.service';
import { ConfirmDialog } from '../../dialogs/confirm.dialog';
import { AuthService   } from '../../auth/auth.service';
import { AppService    } from '../../app.service';

import _omit from "lodash-es/omit";
import _sortBy      from "lodash-es/sortBy";

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './device-list.component.html',
    styleUrls: ['./device.component.css']
})
export class DeviceListComponent implements OnInit {
    @ViewChild(MatSort) sort: MatSort;
    
    clients: Client[];
    devices: MatTableDataSource<Device>;
    cols: string[] = ['esn', 'vessel_name', 'client_name', 'since'];
    
    constructor( private  app:    AppService,
                 public admin:  AdminService) { 
        this.app.title = 'Dispositivos Instalados (admin)';      
    }    

    ngOnInit() {
        this.admin.getDevices()
            .subscribe (data => {
                this.devices = new MatTableDataSource<Device>(data);
        });
    
        this.admin.getClients()
            .subscribe ( (data) => this.clients = _sortBy(data, 'client_name') );
    }
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './device-edit.component.html',
    styleUrls: ['./device.component.css']
})
export class DeviceEditComponent implements OnInit {
    id:     number;
    fresh:  boolean = true;
    ready:  boolean = false;
    
    clients: Client[];
    device: Device;
    form: FormGroup;
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(public  dialog: MatDialog,
                private fb:     FormBuilder,
                private route:  ActivatedRoute,
                private router: Router,
                private app:   AppService,
                private admin: AdminService) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.admin.getClients()
            .subscribe ( (data) => this.clients = data );

        this.route.params.subscribe( addr => {
            this.admin.getDevice(addr.vessel_id)
                .subscribe( (data) => {
                    this.ready  = true;
                    this.device = data;
                    this.form.reset(this.device);
                    this.fresh = !(this.device.vessel_id)
                    this.fresh ? this.form.enable() : 
                                 this.form.disable();
                
                    this.app.title = `Device - ${data.vessel_name}`;
                });
        });

        this.form = this.fb.group({
            client_id:     ['', Validators.required],
            vessel_id:      '',
            vessel_name:   ['', Validators.required],
            esn:           ['', Validators.required],
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    edit() {
        this.form.enable();
        this.form.controls['vessel_id'].disable();
    }
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    drop() {
        if ( this.fresh ) {
            this.router.navigate(['../'], { relativeTo: this.route });
        } else {
            this.form.reset(this.device);
            this.form.disable();
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    del() {
        this.dialog
            .open(ConfirmDialog, {
                data: `Remover ${this.device.vessel_name} permanentemente?`
                })
            .afterClosed().subscribe(result => {
                if ( result && !this.fresh ) {
                    this.admin.delDevice(this.device.esn)
                        .subscribe(() => {
                            this.router.navigate(['../'], { relativeTo: this.route });
                            this.admin.getDevices();
                    });
                }
            });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    save() {
        const id = this.device.vessel_id;
        const load = _omit(this.form.value, 'vessel_id');
        
        if ( this.fresh ) {
            this.admin.postDevice(load)
                .subscribe((data) => { 
                    this.device = data; 
                    this.form.reset(this.device);
                    this.form.disable();
                    this.admin.getDevices();
                    this.router.navigate([`../${data.vessel_id}`], { relativeTo: this.route });

                });
        } else {
            this.admin.putDevice(id, load)
                .subscribe((data) => { 
                    this.device = this.form.value;
                    this.form.reset(this.device);
                    this.form.disable();
                    this.admin.getDevices();
                });
        }
    } 
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {
        
    }
}