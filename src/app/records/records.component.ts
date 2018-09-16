import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from '../data.service';
import { ProgressService } from '../progress.service';
import { DataRecord } from '../models/data';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {

  records: DataRecord[] = []
  displayedRecords: DataRecord[] = []

  constructor(private progress: ProgressService, private dataService: DataService) {
  }

  async ngOnInit() {
    this.progress.executeWithProgress(async () => {
      this.records = await this.dataService.getRecords()
      this.changePage(0, 20)
    })
  }

  changePage(pageIndex, pageSize) {
    this.displayedRecords = this.records.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
  }
}
