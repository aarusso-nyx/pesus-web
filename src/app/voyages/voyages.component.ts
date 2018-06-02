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
    filters: boolean;
    voyages: Voyage[];
    selects: Voyage[];
    
    future:  Voyage[];
    current: Voyage[];
    closed:  Voyage[];
    
    vessels: Vessel[];
    vessel_id: number;
    status_id: number = 0;
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private app:    AppService,
                 private config: ConfigService, 
                 private voy:    VoyageService) {         
        this.app.setTitle('Viagens');      
        
        this.voy.getVoyages()
            .subscribe ( (data) => {
                this.voyages = data;
                this.setFilter();
            
                this.closed  = this.voyages.filter ( i => (!!i.atd && !!i.ata) );
                this.current = this.voyages.filter ( i => (!!i.atd &&  !i.ata) );
                this.future  = this.voyages.filter ( i => ( !i.atd &&  !i.ata) );
            
        });
        
        this.config.getVessels()
            .subscribe ( (data) => this.vessels = data );
    }    

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.voy.refreshVoyages();
        this.config.refreshVessels();
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    setFilter() {
        this.selects = this.voyages.filter((v) => {
            return this.vessel_id ? (this.vessel_id == v.vessel_id) : true;
        }).filter((v) => {
            switch(this.status_id) {
                case 0:
                    return true;
                    
                case 1:
                    return !!v.atd && !v.ata;
                    
                case 2:
                    return !v.atd;
                    
                case 3:
                    return !!v.atd && !!v.ata;
            }
        });  
        
        
        
        this.selects = _sortBy ( this.selects, ['ata', 'atd']).reverse();
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    getStyle( v: Voyage ) : string {
        if ( !v.atd ) {
            return 'item programmed';
        } else if ( !!v.atd && !!v.ata ) {
            return 'item completed';
        } else if ( !!v.atd && !v.ata ) {
            return 'item current';
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
    drawing:  boolean;
    
    form:     FormGroup;
    lances:   FormGroup[];
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( public  dialog: MatDialog,
                 private fb:     FormBuilder,
                 private route:  ActivatedRoute,
                 private router: Router,
                 private app:    AppService,
                 private auth:   AuthService,
                 private config: ConfigService, 
                 private voy:    VoyageService ) { 
        
        this.config.getModels('fishes')
            .subscribe ( (data) => this.allfish = data );
        
        this.config.getModels('fishingtypes')
            .subscribe ( (data) => this.ftypes = data );

        this.config.getModels('winds')
            .subscribe ( (data) => this.winds = data );
        
        this.config.getModels('winddir')
            .subscribe ( (data) => this.winddirs = data );

        this.config.getVessels()
            .subscribe ( (data) => this.vessels = data );
        
        this.config.getPeople()
            .subscribe ( (data) => {
                this.people = data;
                this.masters = this.people.filter(i => !!i.master);
            });
        
        this.config.refreshVessels();
        this.config.refreshPeople();
        
        this.auth.getClient()
            .subscribe((data) => {
                this.id = data.client_id;
            
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
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.route.params.subscribe( addr => {
            let obs: Observable<Voyage>;
            
            if ( addr.voyage_id === 'new') {
                obs = of({ client_id: this.id, crew:[], lances:[] });
            } else {
                obs = this.voy.getVoyage(addr.voyage_id);
            }
            
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
                this.app.getTracks()
                    .subscribe ( (data) => {
                        this.drawing = data.includes(this.voyage.voyage_id);
                    });
            });
        });
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    draw () {
        this.drawing = !this.drawing;
        if ( this.drawing ) {
            this.app.addTrack(this.voyage.voyage_id);
        } else {
            this.app.delTrack(this.voyage.voyage_id);
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    changeFishType(e: number) {
        this.fishes = (!e || !this.allfish) ? [] : 
                     this.allfish.filter( i => i.fishingtype_id == e );
    }
        
    hasLances() : boolean {
        return (this.voyage.lances.length > 0);
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