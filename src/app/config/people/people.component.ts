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
        this.app.setTitle('Pessoas');      
        
        this.config.getPeople()
            .subscribe ( (data) => this.people = _sortBy(data, 'person_name') );
    }    

    ngOnInit() {
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

    person: Person;
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
    ngOnInit() {
        this.route.params.subscribe( addr => {
            let obs: Observable<Person>;
            
            if ( addr.person_id === 'new') {
                obs = of({ client_id: this.id, master: false });
            } else {
                obs = this.config.getModel('people', addr.person_id);
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
                    this.config.delModel('people', this.person.person_id)
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
            this.config.postModel('people', load)
                .subscribe((data) => { 
                    this.person = data; 

                    this.form.reset(this.person);
                    this.form.disable();
                    this.config.refreshPeople();
                    this.router.navigate([`../${data.person_id}`], { relativeTo: this.route });
                });
        } else {
            this.config.putModel('people', id, load)
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