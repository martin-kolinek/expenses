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

  allRecords: EditableRecord[] = []
  records: EditableRecord[] = []
  displayedRecords: EditableRecord[] = []
  pageIndex = 0
  pageSize = 20
  currentFilter: FilterSettings
  defaultCurrency: string

  constructor(private progress: ProgressService,
    private recordService: RecordsService,
    private dialog: MatDialog,
    private filterService: FilterService,
    private settingsService: SettingsService) {
  }

  ngOnInit() {
    this.progress.executeWithProgress(async () => {
      this.defaultCurrency = (await this.settingsService.getSettings()).defaultCurrency
      this.currentFilter = (await this.filterService.getFilters())[0]

      this.allRecords = await this.recordService.getRecords()
      this.records = this.filterService.filterRecords(this.allRecords, this.currentFilter)
      this.changePage(this.pageIndex, this.pageSize)
    })
  }

  changePage(pageIndex, pageSize) {
    this.displayedRecords = this.records.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize)
    this.pageIndex = pageIndex
    this.pageSize = pageSize
  }

  filter() {
    const dialogRef = this.dialog.open(FilterComponent, { data: this.currentFilter })
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return

      this.currentFilter = result as FilterSettings
      this.records = this.filterService.filterRecords(this.allRecords, this.currentFilter)
      this.changePage(this.pageIndex, this.pageSize)
    })
  }
}
