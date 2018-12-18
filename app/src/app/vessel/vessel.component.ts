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

import { Observable, of } from "rxjs";

import { ApiService } from '../api.service';
import { ConfirmDialog } from '../dialogs/confirm.dialog';
import { Vessel, Voyage, 
         Service,
         Client, Area  } from '../app.interfaces';

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
    
    client_id: number;
    clients: Client[];
    filters: string[];
    
    vessels: MatTableDataSource<any>;
    vessels_cols: string[] = ['index', 'client_name', 'esn', 'vessel_name', 
                              'position', 'lastseen', 'status'];
    
    statii = [{status_name: 'Perdidos',   status_col: 'lost'}, 
              {status_name: 'Atracados',  status_col: 'dock'}, 
              {status_name: 'Navegando',  status_col: 'live'}, 
              {status_name: 'Atrasados',  status_col: 'miss'}, 
              {status_name: 'Manutenção', status_col: 'down'}];
    
    constructor(private api: ApiService) { 
        this.filters = this.statii.map(s => s.status_col);
    }

    ngOnInit() {
        this.api.seascape
            .subscribe (data => {
                this.vessels = new MatTableDataSource<any>(data);
                this.vessels.filterPredicate = (data, filter) : boolean => {
                    return ((this.client_id == null) || (this.client_id == data.client_id))
                        && ((this.filters.includes('down') && data.down) ||
                            (this.filters.includes('live') && data.live) ||
                            (this.filters.includes('dock') && data.dock) ||
                            (this.filters.includes('lost') && data.lost) ||
                            (this.filters.includes('miss') && data.miss) );
                }
                this.vessels.filter = 'start';
                this.vessels.sort = this.sort;
        });
    
        this.api.clients
            .subscribe ( (data) => this.clients = _sortBy(data, 'client_name') );
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public style(v) {
        if ( v.down ) {
            return 'down';
        } else if ( v.lost ) {
            return 'lost'; 
        } else if ( v.miss ) {
            return 'miss'; 
        } else { 
            return 'live';
        }
    }      
    
    public track_status(v) {
        if ( v.down ) {
            return 'build';
        } else if ( v.lost ) {
            return 'warning'; 
        } else if ( v.miss ) {
            return 'change_history'; 
        } else if ( v.live ) {
            return 'check_circle_outline';
        }
    }  
    
    public track_tooltip(v) {
        if ( v.down ) {
            return 'Manutenção';
        } else if ( v.lost ) {
            return 'Perdido'; 
        } else if ( v.miss ) {
            return 'Atrasado'; 
        } else if ( v.live ) {
            return 'Transmitindo';
        }
    }  
    
    public power_status(v) {
        if (  v.battery_fail ) {
            return 'battery_alert';
        }

        if ( v.external_power ) {
            return 'battery_charging_full';
        }
        
        return 'battery_std'
    }
    
    public power_tooltip(v) {
        if (  v.battery_fail ) {
            return 'Pilhas Fracas';
        }

        if ( v.external_power ) {
            return 'Alimentação Externa';
        }
        
        return 'Pilhas'
    }
    
    public power_style(v) {
        if (  v.battery_fail ) {
            return 'fail';
        }

        if ( v.external_power ) {
            return 'power';
        }
        
        return 'batt'
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public filterStatus(evt) {
        console.log(evt)
        this.filters = evt.value;
        this.vessels.filter = 'status';
    }
    
    public filterClient(evt) {
        this.client_id = evt.value;
        this.vessels.filter = 'client';
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
    ready:  boolean = false;
    form:   FormGroup;

    clients: Client[];
    vessel:  Vessel;
    ports:   Area[];

    voyages: MatTableDataSource<Voyage>;
    voyage_cols: string[] = ['voyage_id', 'ftype', 'target', 
                            'master', 'atd', 'ata', 'desc', 'status'];
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(private route:  ActivatedRoute,
                private router: Router,
                private dialog: MatDialog,
                private fb:     FormBuilder,
                private api:    ApiService) { }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.api.clientId
            .subscribe((id) => {            
                // Create Form Group
                this.form = this.fb.group({
                      port_id:      '',
                    client_id:      id,
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

        this.api.clients.subscribe(c => this.clients = c);
        this.api.areas.subscribe  (p => this.ports   = p);
        
        this.route.params.subscribe(addr => {
            this.ready = false;
            this.api.getVessel(addr.vessel_id)
                .subscribe( (data) => {
                    this.ready  = true;
                    this.vessel = data;
                    this.form.reset(this.vessel);
                    this.form.disable();
                
                    const voys = _sortBy (data.voyages, ['ata', 'atd']);
                    this.voyages = new MatTableDataSource<any>(voys.reverse());
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
        this.api.putVessel(id, load)
            .subscribe(() => { 
                this.ready = false;
                 this.api.getVessel(id)
                    .subscribe( (data) => {
                        this.ready  = true;
                        this.vessel = data;
                        this.form.reset(this.vessel);
                        this.form.disable();

                        const voys = _sortBy (data.voyages, ['ata', 'atd']);
                        this.voyages = new MatTableDataSource<any>(voys.reverse());
                });
            });
    }    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    perms(evt) {
        const v = evt.option.value;
        if ( evt.option.selected ) {
            this.api.setVesselPerm(v.vessel_id, v.fishingtype_id)
                .subscribe();
        } else {
            this.api.delVesselPerm(v.vessel_id, v.fishingtype_id)
                .subscribe();
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    checks(evt) {
        const v = evt.option.value;
        if ( evt.option.selected ) {
            this.api.setVesselCheck(v.vessel_id, v.check_id)
                .subscribe();
        } else {
            this.api.delVesselCheck(v.vessel_id, v.check_id)
                .subscribe();
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {
        alert('Enviando Documentação da Embarcação '+this.vessel.vessel_name);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    style(v) {
        if ( v.ata ) {
            return 'past'; 
        } else if ( v.atd ) {
            return 'open'; 
        } else {
            return 'prog';
        }
    }  
    
    status(v) {
        if ( v.ata ) {
            return 'Encerrada'; 
        } else if ( v.atd ) {
            return 'Pescando'; 
        } else {
            return 'Programada';
        }
    }     
    
    maint(p) {
        if (p) {
            this.api.postVesselService(this.vessel.vessel_id)
                .subscribe(data => this.vessel.service = data);
        } else {
            this.api.putVesselService(this.vessel.vessel_id)
                .subscribe(data => this.vessel.service = {});
        }
    }
}