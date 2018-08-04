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
import { filter, pairwise } from "rxjs/operators";

import { ConfigService } from '../config.service';
import { ConfirmDialog } from '../../dialogs/confirm.dialog';
import { AuthService   } from '../../auth/auth.service';
import { AppService    } from '../../app.service';
import { Person        } from '../../app.interfaces';

import _omit        from "lodash-es/omit";
import _sortBy      from "lodash-es/sortBy";

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './people-list.component.html',
    styleUrls: ['./people.component.css']
})
export class PeopleListComponent implements OnInit {
    opened: boolean;
    people: Person[];
      
    constructor( private app:    AppService,
                 private config: ConfigService) {
    }    

    ngOnInit() {
        this.app.title = 'Pessoas';      
        
        this.app.sidenav_status
            .subscribe(v => this.opened = v);
        
        this.config.getPeople()
            .subscribe ( (data) => this.people = _sortBy(data, 'person_name') );

        this.config.refreshPeople();
    }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './people-edit.component.html',
    styleUrls: ['./people.component.css']
})
export class PeopleEditComponent implements OnInit {
    id:     number;
    fresh:  boolean = true;
    ready:  boolean = false;
    opened:   boolean;

    person: Person;
    form: FormGroup;

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(private fb:     FormBuilder,
                private route:  ActivatedRoute,
                private router: Router,
                private dialog: MatDialog,
                private app:    AppService,
                private config: ConfigService) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.sidenav_status
            .subscribe (x => this.opened = x);

        this.route.params.subscribe( addr => {            
            let obs: Observable<Person>;
            
            if ( addr.person_id === 'new') {
                obs = of({ client_id: this.id, master: false });
            } else {
                obs = this.config.getPerson(addr.person_id);
            }
            
            obs.subscribe( (data) => {
                this.ready  = true;
                this.person = data;
                this.form.reset(this.person);
                this.fresh = !(this.person.person_id)
                this.fresh ? this.form.enable() : 
                             this.form.disable();
            });
        });
         
        this.config.clientId
            .subscribe((id) => {
                this.id = id;
            
                // Create Form Group
                this.form = this.fb.group({
                    client_id:      this.id,
                    person_id:      '',
                    person_name:   ['', Validators.required],
                    master:         false,
                    cpf:        '',
                    pis:        '',
                    birthday:       '',
                    rgi_number: '',
                    rgi_issued: '',
                    rgi_issuer: '',
                    rgi_expire: '',
                    ric_number: '',
                    ric_issued: '',
                    ric_expire: '',
                    rgp_number: '',
                    rgp_issued: '',
                    rgp_expire: '',
                    rgp_permit: '',
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
            this.form.reset(this.person);
            this.form.disable();
        }
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    del() {
        this.dialog
            .open(ConfirmDialog, {
                data: `Remover ${this.person.person_name} permanentemente?`
                })
            .afterClosed().subscribe(result => {
                if ( result && !this.fresh ) {
                    this.config.delPerson(this.person.person_id)
                        .subscribe(() => {
                            this.router.navigate(['../'], { relativeTo: this.route });
                            this.config.refreshPeople();
                    });
                }
            });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    save() {
        const id = this.person.person_id;
        const load = _omit(this.form.value, 'person_id');
        
        if ( this.fresh ) {
            this.config.postPerson(load)
                .subscribe((data) => { 
                    this.person = data; 

                    this.form.reset(this.person);
                    this.form.disable();
                    this.config.refreshPeople();
                    this.router.navigate([`../${data.person_id}`], { relativeTo: this.route });
                });
        } else {
            this.config.putPerson(id, load)
                .subscribe((data) => { 
                    this.person = this.form.value;
                    this.form.reset(this.person);
                    this.form.disable();
                    this.config.refreshPeople();
                });
        }
    }    

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {
        alert ('Emitindo Relatório do Pescador '+this.person.person_name); 
    }
}