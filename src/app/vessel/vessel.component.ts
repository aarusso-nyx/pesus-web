import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, 
         NavigationEnd,
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
import { filter, pairwise } from "rxjs/operators";

import { ConfigService } from '../config.service';
import { ConfirmDialog } from '../../dialogs/confirm.dialog';
import { AuthService   } from '../../auth/auth.service';
import { AppService    } from '../../app.service';
import { VoyageService } from '../../voyages/voyages.service';
import { Vessel, Client, Area } from '../../app.interfaces';

import _omit from "lodash-es/omit";
import _sortBy      from "lodash-es/sortBy";

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './vessel-list.component.html',
    styleUrls: ['./vessel.component.css']
})
export class VesselListComponent implements OnInit {
    @ViewChild(MatSort) sort: MatSort;
    
    clients: Client[];
    devices: MatTableDataSource<any>;
    cols: string[] = ['client_name', 'esn', 'vessel_name', 
                      'status', 'position', 'lastseen'];
    
    bShow: boolean = false;
    client_id: number;
    
    constructor( private    app:    AppService,
                 private    voy: VoyageService,
                 private config: ConfigService) { 
        this.app.title = 'Frota Ativa';      
    }

    ngOnInit() {
        this.voy.seascape
            .subscribe (data => {
                this.devices = new MatTableDataSource<any>(data);
                this.devices.filterPredicate = (data, filter) : boolean => {
                    return (this.bShow || (data.miss || data.lost)) &&
                    ((this.client_id == null) || (this.client_id == data.client_id));        
                }
                this.devices.filter = 'start';
        });
    
        this.config.clients
            .subscribe ( (data) => this.clients = _sortBy(data, 'client_name') );
    }
    
    
    
    public style(v) {
        if ( v.lost ) {
            return 'lost'; 
        } else if ( v.miss ) {
            return 'miss'; 
        }
    }      
    
    public status(v) {
        if ( v.lost ) {
            return 'Perdido'; 
        } else if ( v.miss ) {
            return 'Atrasado'; 
        } else if ( v.sail ) {
            return 'Navegando';
        } else if ( v.dock ) {
            return 'Atracado';
        }
    }  
    
    
    public filterStatus(evt) {
        this.bShow = evt.checked;
        this.devices.filter = 'status';
    }
    
    public filterClient(evt) {
        this.client_id = evt.value;
        this.devices.filter = 'client';
    }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './vessel-edit.component.html',
    styleUrls: ['./vessel.component.css']
})
export class VesselEditComponent implements OnInit {
    id:     number;
    opened: boolean;
    ready:  boolean = false;
    form:   FormGroup;
    vessel: Vessel;

    clients: Client[];
    ports: Area[];
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(private route:  ActivatedRoute,
                private router: Router,
                private dialog: MatDialog,
                private fb:     FormBuilder,
                private app:    AppService,
                private config: ConfigService) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.config.clientId
            .subscribe((id) => {
                this.id = id;
            
                // Create Form Group
                this.form = this.fb.group({
                      port_id:      '',
                    client_id:      this.id,
                    vessel_id:      '',
                    vessel_name:   ['', Validators.required],
                    esn:           ['', Validators.required],
                    tank_capacity:  '',
                    crew_number:    '',
                    insc_number:    '',
                    insc_issued:    '',
                    insc_expire:    '',
                    ship_lenght:    '',
                    ship_breadth:   '',
                    draught_min:    '',
                    draught_max:    '',
                });
            });

        this.config.clients.subscribe(c => this.clients = c);
        this.config.areas.subscribe  (p => this.ports   = p);
        
        this.route.params.subscribe( addr => {
            this.ready = false;
            this.config.getVessel(addr.vessel_id)
                .subscribe( (data) => {
                    this.ready  = true;
                    this.vessel = data;
                    this.form.reset(this.vessel);
                    this.form.disable();
            });
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    edit() {
        this.form.enable();
        this.form.controls['esn'].disable();
        this.form.controls['vessel_name'].disable();
    }
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    drop() {
        this.form.reset(this.vessel);
        this.form.disable();
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    save() {
        const id = this.vessel.vessel_id;
        const load = _omit(this.form.value, ['vessel_id', 'vessel_name', 'esn']);
        this.config.putVessel(id, load)
            .subscribe((data) => { 
                this.vessel = this.form.value;
                this.form.reset(this.vessel);
                this.form.disable();
            });
    }    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    perms(evt) {
        const v = evt.option.value;
        if ( evt.option.selected ) {
            this.config.setVesselPerm(v.vessel_id, v.fishingtype_id)
                .subscribe();
        } else {
            this.config.delVesselPerm(v.vessel_id, v.fishingtype_id)
                .subscribe();
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    checks(evt) {
        const v = evt.option.value;
        if ( evt.option.selected ) {
            this.config.setVesselCheck(v.vessel_id, v.check_id)
                .subscribe();
        } else {
            this.config.delVesselCheck(v.vessel_id, v.check_id)
                .subscribe();
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {
        alert('Enviando Documentação da Embarcação '+this.vessel.vessel_name);
    }
}