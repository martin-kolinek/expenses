import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from '../data.service';
import { ProgressService } from '../progress.service';
import { EditableRecord } from '../models/editable';
import { MatDialog } from '@angular/material/dialog';
import { FilterComponent } from '../filter/filter.component';
import { FilterService } from '../filter.service';
import { SettingsService } from '../settings.service';
import { FilterSettings } from '../models/settings';

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
    private dataService: DataService,
    private dialog: MatDialog,
    private filterService: FilterService,
    private settings: SettingsService) {
  }

  async ngOnInit() {
    this.progress.executeWithProgress(async () => {
      const filter = (await this.settings.getFilters())[0]

      this.allRecords = await this.dataService.getRecords()
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
      this.records = this.filterService.filterRecords(this.allRecords, result as FilterSettings)
      this.changePage(this.pageIndex, this.pageSize)
    })
  }
}
