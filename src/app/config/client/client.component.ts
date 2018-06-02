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
    id:     number;
    client: Client;
    origin: Client;
    profile: any;
    
    editing: boolean = false;
    ready:   boolean = false;
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor(private app:    AppService,
                private auth:   AuthService,
                private route:  ActivatedRoute,
                private router: Router,
                private config: ConfigService ) { 
    
        this.app.setTitle('Empresa');
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.auth.getProfile()
            .subscribe( p => this.profile = p);
        
        this.config.getClient()
            .subscribe ( (data) => { 
                this.client = data; 
                this.origin = data;
                this.ready = true;
            });
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    edit() {
        this.editing = true;
    }    

    drop() {
        this.client = this.origin;
        this.editing = false;
    }

    save() {
        this.config.putClient(this.client)
            .subscribe((data) => { 
                this.client = data; 
                this.origin = data;
                this.editing = false;
            });
    }
    
    print() {
        alert('Emitindo Documentação do Armador '+ this.client.client_name);
    }
}