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
import { map } from "rxjs/operators";

import { ConfirmDialog } from '../dialogs/confirm.dialog';
import { ApiService    } from '../api.service';
import { AuthService   } from '../auth/auth.service';
import { Fish, FishingType, 
         Lance, Crew, Voyage,
         Person, Vessel, 
         WindDir, Wind } from '../app.interfaces';

 
import _remove from "lodash-es/remove";
import _sortBy from "lodash-es/sortBy";
import _omit   from "lodash-es/omit";
import _pick   from "lodash-es/pick";

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './voyages-edit.component.html',
    styleUrls: ['./voyages.component.css']
})
export class VoyageEditComponent implements OnInit {    
    voyage:   Voyage;
    vessel:   Vessel;
    
    allfish:  Fish[];
    fishes:   Fish[];
    ftypes:   FishingType[];
    winds:    Wind[];
    winddirs: WindDir[];
    masters:  Person[];
    people:   Person[];
    
    id:       number;
    fresh:    boolean = true;
    ready:    boolean = false;
    
    crew:     Crew[];
    form:     FormGroup;
    lances:   FormGroup[];
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private dialog: MatDialog,
                 private fb:     FormBuilder,
                 private route:  ActivatedRoute,
                 private router: Router,
                 private api:     ApiService ) { } 
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.api.fishes
            .subscribe ( (data) => this.allfish = data );

        this.api.winds
            .subscribe ( (data) => this.winds = data );
        
        this.api.winddirs
            .subscribe ( (data) => this.winddirs = data );
        
        this.api.people
            .subscribe ( (data) => {
                this.people = data;
                this.masters = this.people.filter(i => !!i.master);
            });
        
    // chamando getvessel 4x    
        this.route.params.subscribe(addr => {
            this.api.getVessel(addr.vessel_id).subscribe(vessel => {            
                this.vessel = vessel;
                this.ftypes = vessel.perms.filter (p => p.value);
                
                this.form = this.fb.group({
                    vessel_id:       addr.vessel_id,
                    voyage_desc:     '',
                    ata:             '',
                    atd:             '',
                    master_id:      ['', Validators.required],
                    fishingtype_id: ['', Validators.required],
                    target_fish_id: ['', Validators.required],
                });
                
                let obs: Observable<Voyage>;
                if ( addr.voyage_id === 'new') {
                    obs = of({ vessel_id: addr.vessel_id, 
                               voyage_id: null, 
                               crew:[], lances:[] });
                } else {
                    obs = this.api.getVoyage(addr.voyage_id);
                }

                this.ready = false;
                obs.subscribe( (data) => {
                    this.ready  = true;
                    this.voyage = data;
                    this.id = data.voyage_id;
                    this.form.reset(this.voyage);
                    this.fresh = !(this.id)
                    this.fresh ? this.form.enable() : 
                                 this.form.disable();

                    this.crew = data.crew.map(c => _pick(c, ['voyage_id','person_id']))

                    this.lances = data.lances.map(l => {
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
        if ( this.hasLances() ) {
            this.form.controls['fishingtype_id'].disable()
        }
    }
    
    drop() {
//        if ( this.fresh ) {
//            this.router.navigate(['../../'], { relativeTo: this.route });
//        } else {
            this.form.reset(this.voyage);
            this.form.disable();
//        }
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    del() {
          this.dialog
            .open(ConfirmDialog, {
                data: `Remover esta viagem de ${this.vessel.vessel_name} permanentemente?`
            })
            .afterClosed().subscribe(result => {
                if ( result && !this.fresh ) {
                    this.api.delVoyage(this.id)
                        .subscribe(() => {
                            this.router.navigate(['../../'], { relativeTo: this.route });
                        });
                }
            });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    save() {
//        const load = _omit(this.form.value, 'voyage_id');
//        const load = _omit(this.form.value, 'voyage_id');

        let obs: Observable<Voyage>; 
        if ( this.fresh ) {
            obs = this.api.postVoyage(this.form.value);
        } else {
            obs = this.api.putVoyage(this.voyage.voyage_id, this.form.value)
                        .pipe ( map(v => this.form.value) );
        }
                
        obs.subscribe((data) => { 
            this.voyage = data;
            if ( this.fresh ) {
                this.router.navigate(['../'+data.voyage_id], { relativeTo: this.route });
            }
            
            this.crew
                .filter(c => !!c.person_id)
                .map (c => {
                    this.api.setCrew(data.voyage_id, c.person_id).subscribe();                
                });

            this.form.reset(this.voyage);
            this.form.disable();
        });
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
        this.crew.push({});
    }
            
    delCrew ( c: Crew ) {
        const obs = c.person_id ? this.api.delCrew(this.id, c.person_id) : of(null);    
        obs.subscribe(() => _remove (this.crew, i => i.person_id == c.person_id));
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    addLance() {
        const Lance = { voyage_id: this.id };
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
            this.api.delLance(this.id, id)
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
            this.api.putLance(this.id, id, load)
                .subscribe((data) => { 
                    this.voyage.lances[i] = l.value;
                    l.reset(l.value);
                    l.disable()
                });
        } else {
            this.api.postLance(this.id, load)
                .subscribe((data) => { 
                    this.voyage.lances[i] = data;
                    l.reset(data);
                    l.disable()
                });
        }
    }
}