import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ProgressService } from '../progress.service';
import { EditableRecord } from '../models/editable';
import { MatDialog } from '@angular/material/dialog';
import { FilterComponent } from '../filter/filter.component';
import { FilterService } from '../filter.service';
import { FilterSettings } from '../models/data';
import { RecordsService } from '../records.service';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css']
})
export class RecordsComponent implements OnInit {

  allRecords: EditableRecord[] = []
  records: EditableRecord[] = []
  displayedRecords: EditableRecord[] = []
  pageIndex = 0
  pageSize = 20

  constructor(private progress: ProgressService,
    private recordService: RecordsService,
    private dialog: MatDialog,
    private filterService: FilterService) {
  }

  async ngOnInit() {
    this.progress.executeWithProgress(async () => {
      const filter = (await this.filterService.getFilters())[0]

      this.allRecords = await this.recordService.getRecords()
      this.records = this.filterService.filterRecords(this.allRecords, filter)
      this.changePage(this.pageIndex, this.pageSize)
    })
  }

  changePage(pageIndex, pageSize) {
    this.displayedRecords = this.records.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
    this.pageIndex = pageIndex
    this.pageSize = pageSize
  }

  filter() {
    const dialogRef = this.dialog.open(FilterComponent)
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return

      this.records = this.filterService.filterRecords(this.allRecords, result as FilterSettings)
      this.changePage(this.pageIndex, this.pageSize)
    })
  }
}
