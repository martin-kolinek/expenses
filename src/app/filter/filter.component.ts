import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SettingsService } from '../settings.service';
import { ProgressService } from '../progress.service';
import { FilterSettings, SortColumnType, SortDirectionType } from '../models/settings';
import { Moment, utc } from 'moment';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  existingFilters
  filters: (FilterSettings | "new")[];
  selectedFilter: FilterSettings | "new"
  sortDirectionLabel: string

  private _start: Moment | null
  get start() { return this._start }
  set start(d: Moment | null) { this._start = d; this.changed = true }
  private _end: Moment | null
  get end() { return this._end }
  set end(d: Moment | null) { this._end = d; this.changed = true }
  private _sortColumn: SortColumnType
  get sortColumn() { return this._sortColumn }
  set sortColumn(c: SortColumnType) { this._sortColumn = c; this.changed = true }
  private _sortDirection: SortDirectionType
  get sortDirection() { return this._sortDirection == "asc" }
  set sortDirection(d: boolean) {
    this._sortDirection = d ? "asc" : "desc";
    this.sortDirectionLabel = d ? "Ascending" : "Descending"
    this.changed = true
  }
  private _name: string
  get name() { return this._name }
  set name(n: string) { this._name = n; this.changed = true }
  changed: boolean

  constructor(private dialogRef: MatDialogRef<FilterComponent>, private settings: SettingsService, private progress: ProgressService) { }

  ngOnInit() {
    this.progress.executeWithProgress(async () => {
      this.filters = await this.settings.getFilters()
      this.filters.push("new")
      this.setFilter(this.filters[0])
    })
  }

  setFilter(filter: FilterSettings | "new") {
    this.selectedFilter = filter
    if (filter == "new") {
      this.changed = false
      this.name = ""
      return
    }

    if (filter.start) {
      this.start = utc(filter.start)
    }
    else {
      this.start = null
    }

    if (filter.end) {
      this.end = utc(filter.end)
    }
    else {
      this.end = null
    }

    this.sortColumn = filter.sortColumn
    this.sortDirection = filter.sortDirection == "asc"
    this.name = filter.name
    this.changed = false
  }

  apply() {
    if (!this.name) {
      return
    }

    this.dialogRef.close({
      name: this.name,
      sortDirection: this._sortDirection,
      sortColumn: this.sortColumn,
      excludedCategories: [],
      start: this.start ? this.start.utc() : null,
      end: this.end ? this.end.utc() : null
    })
  }

}
