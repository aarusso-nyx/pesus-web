import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute,
         Router }        from '@angular/router';
import { FormBuilder,
         FormGroup,
         Validators    } from '@angular/forms';
import { MatTableDataSource,
         MatPaginator, 
         MatSort,
         MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { Observable, of } from "rxjs";

import { ApiService     } from '../api.service';
import { ConfirmDialog  } from '../dialogs/confirm.dialog';
import { AuthService    } from '../auth/auth.service';
import { Person, Client } from '../app.interfaces';

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
    @ViewChild(MatSort) sort: MatSort;
    
    client_id: number;
    clients: Client[];

    people: MatTableDataSource<Person>;
    people_cols: string[] = ['person_name'];
    
    constructor(private api: ApiService) { }    

    ngOnInit() {
        this.api.people
            .subscribe (data => { 
                this.people = new MatTableDataSource<Person>(_sortBy(data, 'person_name'));
                this.people.filterPredicate = (data, filter) : boolean => {
                    return (this.client_id == null) || (this.client_id == data.client_id);        
                }
                this.people.filter = 'start';
                this.people.sort = this.sort;
        });
        
        this.api.clients
            .subscribe ( (data) => this.clients = _sortBy(data, 'client_name') );
    }
    
    public filterClient(evt) {
        this.client_id = evt.value;
        this.people.filter = 'client';
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
    constructor(private fb:     FormBuilder,
                private route:  ActivatedRoute,
                private router: Router,
                private dialog: MatDialog,
                private api: ApiService) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.route.params.subscribe( addr => {            
            let obs: Observable<Person>;
            
            if ( addr.person_id === 'new') {
                obs = of({ client_id: this.id, master: false });
            } else {
                obs = this.api.getPerson(addr.person_id);
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
         
        this.api.clientId
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
                    this.api.delPerson(this.person.person_id)
                        .subscribe(() => {
                            this.router.navigate(['../'], { relativeTo: this.route });
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
            this.api.postPerson(load)
                .subscribe((data) => { 
                    this.person = data; 

                    this.form.reset(this.person);
                    this.form.disable();
                    this.router.navigate([`../${data.person_id}`], { relativeTo: this.route });
                    this.api.updatePeople();
                });
        } else {
            this.api.putPerson(id, load)
                .subscribe((data) => { 
                    this.person = this.form.value;
                    this.form.reset(this.person);
                    this.form.disable();
                    this.api.updatePeople();
                });
        }
    }    

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    print() {
        alert ('Emitindo Relatório do Pescador '+this.person.person_name); 
    }
}