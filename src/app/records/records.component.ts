import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from '../data.service';
import { ProgressService } from '../progress.service';
import { EditableRecord } from '../models/editable';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {

  records: EditableRecord[] = []
  displayedRecords: EditableRecord[] = []

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
