import { Component, Inject } from '@angular/core';
import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

@Component({
    templateUrl: './confirm.dialog.html',
})
export class ConfirmDialog {    
    constructor ( public dialogRef: MatDialogRef<ConfirmDialog>,
                  @Inject(MAT_DIALOG_DATA) public data: any) {}
}