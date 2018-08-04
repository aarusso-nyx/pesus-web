import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute }    from '@angular/router';

import { ConfigService }     from '../config.service';
import { AuthService   }     from '../../auth/auth.service';
import { AppService    }     from '../../app.service';
import { Client        }     from '../../app.interfaces';

@Component({
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
    client: Client;
    profile: any;
    ready:   boolean = false;
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(private app:    AppService,
                private auth:   AuthService,
                private config: ConfigService ) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.title = 'Empresa';
        
        this.auth.profile
            .subscribe(p => this.profile = p);
        
        this.config.client
            .subscribe ( (data) => { 
                this.client = data; 
                this.ready = true;
            });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    checks(evt) {
        const v = evt.option.value;
        if ( evt.option.selected ) {
            this.config.setClientCheck(v.client_id, v.check_id)
                .subscribe();
        } else {
            this.config.delClientCheck(v.client_id, v.check_id)
                .subscribe();
        }
    }
    
    print() {
        alert('Emitindo Documentação do Armador '+ this.client.client_name);
    }
}