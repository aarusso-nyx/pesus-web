import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, 
         NavigationEnd,
         Router }        from '@angular/router';
import { FormBuilder,
         FormGroup,
         Validators    } from '@angular/forms';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { Observable,of } from "rxjs";
import { filter, pairwise } from "rxjs/operators";

import { ConfigService } from '../config.service';
import { ConfirmDialog } from '../../dialogs/confirm.dialog';
import { AuthService   } from '../../auth/auth.service';
import { AppService    } from '../../app.service';
import { Vessel        } from '../../app.interfaces';

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
    opened:  boolean;
    vessels: Vessel[];
    
    constructor( private router: Router,
                 private app:    AppService,
                 private config: ConfigService) { }    

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.title = 'Embarcações';      
    
        this.app.sidenav_status
            .subscribe(v => this.opened = v);
        
        this.config.vessels
            .subscribe ( (data) => this.vessels = _sortBy(data, 'vessel_name') );
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
        this.app.sidenav_status
            .subscribe (x => this.opened = x);
        
        this.config.clientId
            .subscribe((id) => {
                this.id = id;
            
                // Create Form Group
                this.form = this.fb.group({
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