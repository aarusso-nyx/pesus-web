import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,
         Router }    from '@angular/router';
import { FormBuilder,
         FormGroup,
         FormArray,
         Validators } from '@angular/forms';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { Observable,of } from "rxjs";

import { VoyageService } from './voyages.service';
import { ConfirmDialog } from '../dialogs/confirm.dialog';
import { ConfigService } from '../config/config.service';
import { AuthService   } from '../auth/auth.service';
import { AppService    } from '../app.service';
import { Fish, FishingType, 
         Lance, Crew, Voyage,
         Person, Vessel, 
         WindDir, Wind } from '../app.interfaces';

 
import _remove from "lodash-es/remove";
import _sortBy from "lodash-es/sortBy";
import _omit   from "lodash-es/omit";

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './voyages-list.component.html',
    styleUrls: ['./voyages.component.css']
})
export class VoyageListComponent implements OnInit {
    opened:  boolean = true;
    filter:  boolean = false;
    voyages: Voyage[];
    voyage_: Voyage[];
    
    vessels: Vessel[];
    vessel_id: number;
    status_id: number = 0;
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private route:  ActivatedRoute,
                 private app:    AppService,
                 private config: ConfigService, 
                 private voy:    VoyageService) { }    

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.title = 'Viagens';      

        this.route.params
            .subscribe( (addr) => this.app.sidenav_open() );

        this.app.sidenav_status
            .subscribe(v => this.opened = v);
        
        this.voy.getVoyages()
            .subscribe ( (data) => {
                this.voyage_ = data.map(v => {
                    v.status_id = !!v.atd ? (!!v.ata ? 3 : 2) : 1;
                    return v;
                });
                this.setFilter(null);
        });
            
        this.voy.refreshVoyages();
        
        this.config.vessels
            .subscribe ( (data) => this.vessels = data );
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    setFilter(status) {
        if (status != undefined) {
            this.status_id = status;
        }
        
        this.voyages = _sortBy (this.voyage_
                        .filter(v => this.vessel_id ? (this.vessel_id == v.vessel_id) : true)
                        .filter(v => this.status_id ? (this.status_id == v.status_id) : true),
                        ['ata', 'atd']).reverse();     
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getStyle( v: Voyage ) : string {
        switch (v.status_id) {
            case 1: return 'item completed';
            case 2: return 'item current';
            case 3: return 'item programmed';
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './voyages-edit.component.html',
    styleUrls: ['./voyages.component.css']
})
export class VoyageEditComponent implements OnInit {    
    voyage:   Voyage;
    
    vessels:  Vessel[];
    allfish:  Fish[];
    fishes:   Fish[];
    ftypes:   FishingType[];
    winds:    Wind[];
    winddirs: WindDir[];
    masters:  Person[];
    people:   Person[];
    
    id:       number;
    tab:      number  = 0;
    fresh:    boolean = true;
    ready:    boolean = false;
    opened:   boolean;

    drawing:  boolean;
    
    form:     FormGroup;
    lances:   FormGroup[];
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private dialog: MatDialog,
                 private fb:     FormBuilder,
                 private route:  ActivatedRoute,
                 private router: Router,
                 private app:    AppService,
                 private config: ConfigService, 
                 private voy:    VoyageService ) { }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.sidenav_status
            .subscribe (x => this.opened = x);

        this.config.fishes
            .subscribe ( (data) => this.allfish = data );
        
        this.config.fishingtypes
            .subscribe ( (data) => this.ftypes = data );

        this.config.winds
            .subscribe ( (data) => this.winds = data );
        
        this.config.winddirs
            .subscribe ( (data) => this.winddirs = data );

        this.config.vessels
            .subscribe ( (data) => this.vessels = data );
        
        this.config.getPeople()
            .subscribe ( (data) => {
                this.people = data;
                this.masters = this.people.filter(i => !!i.master);
            });
        
        this.config.refreshPeople();
        
        this.config.clientId
            .subscribe((id) => {
                this.id = id;
            
                // Create Form Group
                this.form = this.fb.group({
                    client_id:       this.id,
                    voyage_id:       '',
                    voyage_desc:     '',
                    ata:             '',
                    eta:             '',
                    atd:             '',
                    etd:            ['', Validators.required],
                    vessel_id:      ['', Validators.required],
                    master_id:      ['', Validators.required],
                    fishingtype_id: ['', Validators.required],
                    target_fish_id: ['', Validators.required],
                });
            });
        
        this.route.params.subscribe( addr => {
            let obs: Observable<Voyage>;
            
            if ( addr.voyage_id === 'new') {
                obs = of({ client_id: this.id, crew:[], lances:[] });
            } else {
                obs = this.voy.getVoyage(addr.voyage_id);
            }
            
            this.ready = false;
            obs.subscribe( (data) => {
                this.ready  = true;
                this.voyage = data;
                this.form.reset(this.voyage);
                this.fresh = !(this.voyage.voyage_id)
                this.fresh ? this.form.enable() : 
                             this.form.disable();

                
                this.lances = data.lances.map((l) => {
                    return this.fb.group({
                        voyage_id:         [l.voyage_id, Validators.required],
                        fish_id:            l.fish_id,
                        weight:             l.weight,
                        winddir_id:         l.winddir_id,
                        wind_id:            l.wind_id,
                        temp:               l.temp,
                        depth:              l.depth,
                        lance_id:           l.lance_id,
                        lance_start:       [l.lance_start, Validators.required],
                        lance_end:          l.lance_end,
                    });
                }); 
                
                this.lances.forEach( l => l.disable() );
                
                this.changeFishType(this.voyage.fishingtype_id);
            });
        });
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    changeFishType(e: number) {
        this.fishes = (!e || !this.allfish) ? [] : 
                     this.allfish.filter( i => i.fishingtype_id == e );
    }
        
    hasLances() : boolean {
        return (this.voyage.lances && this.voyage.lances.length > 0);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    edit() {
        this.form.enable();
        if ( this.voyage.lances.length > 0) {
            this.form.controls['fishingtype_id'].disable()
        }
    }
    
    drop() {
        if ( this.fresh ) {
            this.router.navigate(['../'], { relativeTo: this.route });
        } else {
            this.form.reset(this.voyage);
            this.form.disable();
        }
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    del() {
          this.dialog
            .open(ConfirmDialog, {
                data: `Remover ${this.voyage.vessel.vessel_name} permanentemente?`
            })
            .afterClosed().subscribe(result => {
                if ( result && !this.fresh ) {
                    this.voy.delVoyage(this.voyage.voyage_id)
                        .subscribe(() => {
                            this.router.navigate(['../'], { relativeTo: this.route });
                            this.voy.refreshVoyages();
                        });
                }
            });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    save() {
        const id = this.voyage.voyage_id;
        const load = _omit(this.form.value, 'voyage_id');
        
        if ( this.fresh ) {
            this.voy.postVoyage(load)
                .subscribe((data) => { 
                    this.voyage = data; 
                    this.form.reset(this.voyage);
                    this.form.disable();
                    this.voy.refreshVoyages();
                });
        } else {
            this.voy.putVoyage(id, load)
                .subscribe((data) => { 
                    this.voyage = this.form.value;
                    this.form.reset(this.voyage);
                    this.form.disable();
                    this.voy.refreshVoyages();
                });
        }
    }    
        
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {
        alert('Emitindo Mapas de Bordo');
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    addCrew() {
        this.voyage.crew.push({ editing: true });
    }
        
    editCrew ( c: Crew ) {
        c.editing = true;
    }
    
    dropCrew ( c: Crew ) {
        c.editing = false;
        if ( !c.person_id ) {
            _remove (this.voyage.crew, i => i == c);
        }
    }
    
    saveCrew ( c: Crew ) {
        this.voy.setCrew(this.voyage.voyage_id, c.person_id)
            .subscribe(() => c.editing = false);
    }
        
    delCrew ( c: Crew ) {
        if ( c.person_id ) {
            this.voy.delCrew(this.voyage.voyage_id, c.person_id)
                .subscribe(() => {
                    c.editing = false;
                    _remove (this.voyage.crew, i => i.person_id == c.person_id);
            });
        } else {
            c.editing = false;
            _remove (this.voyage.crew, i => i.person_id == c.person_id);
        }
    }
    
    anyCrew () : boolean {
        return this.voyage.crew.some(i => i.editing);    
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    addLance() {
        const Lance = { voyage_id: this.voyage.voyage_id };
        const LanceForm = this.fb.group({
            voyage_id:          '',
            fish_id:            '',
            weight:             '',
            winddir_id:         '',
            wind_id:            '',
            temp:               '',
            depth:              '',
            lance_id:           '',
            lance_start:        '',
            lance_end:          '',
        });

        LanceForm.reset(Lance);
        LanceForm.enable();
        
        this.voyage.lances.unshift(Lance);
        this.lances.unshift(LanceForm);
    }
    
    
    dropLance(l: FormGroup, i: number) {
        const L = this.voyage.lances[i];  
        if (L.lance_id) {
            l.reset(L);
            l.disable();
        } else {
            this.voyage.lances.splice(i,1);
            this.lances.splice(i,1);
        }
    }

    
    delLance (l: FormGroup, i: number) {
        const id = l.value.lance_id;
        if ( id ) {
            this.voy.delLance(this.voyage.voyage_id, id)
                .subscribe(() => {
                this.voyage.lances.splice(i,1);
                this.lances.splice(i,1);
            });
        } else {
            this.voyage.lances.splice(i,1);
            this.lances.splice(i,1);
        }
    }
    
    
    saveLance (l: FormGroup, i: number ) {
        const id = l.value.lance_id;
        const load = _omit(l.value, 'lance_id');
        if ( id ) {
            this.voy.putLance(this.voyage.voyage_id, id, load)
                .subscribe((data) => { 
                    this.voyage.lances[i] = l.value;
                    l.reset(l.value);
                    l.disable()
                });
        } else {
            this.voy.postLance(this.voyage.voyage_id, load)
                .subscribe((data) => { 
                    this.voyage.lances[i] = data;
                    l.reset(data);
                    l.disable()
                });
        }
    }
}