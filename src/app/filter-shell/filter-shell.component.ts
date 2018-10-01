import { Component, OnInit, ViewChild, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { ShellComponent } from '../shell/shell.component';
import { FilterComponent } from '../filter/filter.component';
import { MatDialog } from '@angular/material';
import { FilterService } from '../filter.service';
import { ProgressService } from '../progress.service';
import { EditableRecord, FilterResult } from '../models/editable';
import { FilterSettings } from '../models/data';
import { RecordsService } from '../records.service';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'app-filter-shell',
  templateUrl: './filter-shell.component.html',
  styleUrls: ['./filter-shell.component.css']
})
export class FilterShellComponent implements OnInit {

  @ViewChild("shell") shell: ShellComponent
  currentFilter: FilterSettings;
  allRecords: EditableRecord[];

  @Input()
  get title() {
    return this.shell.title
  }
  set title(t: string) {
    this.shell.title = t
  }

  @Input() toolbarTemplate: TemplateRef<any>

  @Output() recordsChanged: EventEmitter<FilterResult> = new EventEmitter<FilterResult>()
  @Output() defaultCurrencyChanged: EventEmitter<string> = new EventEmitter<string>()

  constructor(
    private dialog: MatDialog,
    private filterService: FilterService,
    private recordService: RecordsService,
    private settingsService: SettingsService,
    private progress: ProgressService
  ) { }

  async ngOnInit() {
    await this.progress.executeWithProgress(async () => {
      this.currentFilter = (await this.filterService.getFilters())[0]
      this.defaultCurrencyChanged.emit((await this.settingsService.getSettings()).defaultCurrency)

      this.allRecords = await this.recordService.getRecords()
      this.emitEvent()
    })
  }

  filter() {
    const dialogRef = this.dialog.open(FilterComponent, { data: this.currentFilter })
    dialogRef.afterClosed().subscribe(result => {
      if (!result) return

      this.currentFilter = result as FilterSettings
      this.emitEvent()
    })
  }

  private emitEvent() {
    this.recordsChanged.emit(this.filterService.filterRecords(this.allRecords, this.currentFilter))
  }
}
