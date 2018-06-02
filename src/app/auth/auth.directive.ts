import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Directive({ selector: '[nyxAuth]'})
export class AuthDirective {

    constructor(
        private auth: AuthService,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef ) { }

    @Input() set nyxAuth( scope: string ) {        
        this.auth.getPolicy().subscribe(policies => {
            policies && policies.permissions.includes(scope) ?
                this.viewContainer.createEmbeddedView(this.templateRef) :
                this.viewContainer.clear();
        });
    }
}