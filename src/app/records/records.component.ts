import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { ToolbarService } from '../toolbar.service';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements AfterViewInit {

  @ViewChild('testTemplate') fileInput: TemplateRef<any>

  constructor(private toolbarService: ToolbarService) {

  }

  ngAfterViewInit() {
    this.toolbarService.template = this.fileInput
  }

  ngOnInit() {
  }

}
