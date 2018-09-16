import { Component, OnInit, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.css']
})
export class ShellComponent implements OnInit {

  @Input() toolbarTemplate: TemplateRef<any>

  constructor() { }

  ngOnInit() {
  }

}
