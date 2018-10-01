import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ProgressService } from '../progress.service';
import { EditableRecord } from '../models/editable';
import { MatDialog } from '@angular/material/dialog';
import { FilterComponent } from '../filter/filter.component';
import { FilterService } from '../filter.service';
import { FilterSettings } from '../models/data';
import { RecordsService } from '../records.service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {

  records: EditableRecord[] = []
  displayedRecords: EditableRecord[] = []
  pageIndex = 0
  pageSize = 20
  defaultCurrency: string

  constructor() {
  }

  ngOnInit() {
  }

  updateRecords(rec: EditableRecord[]) {
    this.records = rec
    this.changePage(this.pageIndex, this.pageSize)
  }

  changePage(pageIndex, pageSize) {
    this.displayedRecords = this.records.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
    this.pageIndex = pageIndex
    this.pageSize = pageSize
  }
}
