import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, 
         Router }        from '@angular/router';
import { FormBuilder,
         FormGroup,
         Validators    } from '@angular/forms';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { Observable,of } from "rxjs";

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
    
    constructor( private app:    AppService,
                 private config: ConfigService) {         
        this.app.setTitle('Embarcações');      
        
        this.config.getVessels()
            .subscribe ( (data) => this.vessels = _sortBy(data, 'vessel_name') );
    }    

    ngOnInit() {
        this.config.refreshVessels();
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
    fresh:  boolean = true;
    ready:  boolean = false;
    
    vessel: Vessel;
    form: FormGroup;
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(public  dialog: MatDialog,
                private fb:     FormBuilder,
                private route:  ActivatedRoute,
                private router: Router,
                private auth:   AuthService,
                private config: ConfigService) { 

        this.auth.getClient()
            .subscribe((data) => {
                this.id = data.client_id;
                
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
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.route.params.subscribe( addr => {
            let obs: Observable<Vessel>;
            
            if ( addr.vessel_id === 'new') {
                obs = of({ client_id: this.id });
            } else {
                obs = this.config.getModel('vessels', addr.vessel_id);
            }
            
            obs.subscribe( (data) => {
                this.ready  = true;
                this.vessel = data;
                this.form.reset(this.vessel);
                this.fresh = !(this.vessel.vessel_id)
                this.fresh ? this.form.enable() : 
                             this.form.disable();
            });
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    drop() {
        if ( this.fresh ) {
            this.router.navigate(['../'], { relativeTo: this.route });
        } else {
            this.form.reset(this.vessel);
            this.form.disable();
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    del() {
        this.dialog
            .open(ConfirmDialog, {
                data: `Remover ${this.vessel.vessel_name} permanentemente?`
                })
            .afterClosed().subscribe(result => {
                if ( result && !this.fresh ) {
                    this.config.delModel('vessels', this.vessel.vessel_id)
                        .subscribe(() => {
                            this.router.navigate(['../'], { relativeTo: this.route });
                            this.config.refreshVessels();
                    });
                }
            });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    save() {
        const id = this.vessel.vessel_id;
        const load = _omit(this.form.value, 'vessel_id');
        
        if ( this.fresh ) {
            this.config.postModel('vessels', load)
                .subscribe((data) => { 
                    this.vessel = data; 
                    this.form.reset(this.vessel);
                    this.form.disable();
                    this.config.refreshVessels();
                    this.router.navigate([`../${data.vessel_id}`], { relativeTo: this.route });

                });
        } else {
            this.config.putModel('vessels', id, load)
                .subscribe((data) => { 
                    this.vessel = this.form.value;
                    this.form.reset(this.vessel);
                    this.form.disable();
                    this.config.refreshVessels();
                });
        }
    }    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {
        alert('Enviando Documentação da Embarcação '+this.vessel.vessel_name);
    }
}