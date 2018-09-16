import { Component, OnInit, TemplateRef, ViewChild, NgZone } from '@angular/core';
import { ErrorService } from '../error.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

  @ViewChild('template') template: TemplateRef<any>;
  constructor(private errors: ErrorService, private snackBar: MatSnackBar, private zone: NgZone) { }

  ngOnInit() {
    this.errors.errors.subscribe(() => {
      this.zone.run(() => {
        this.snackBar.open("An error has occurred, please try again, or refresh the browser")
      })
    })
  }

}
