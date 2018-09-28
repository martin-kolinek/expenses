import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProgressService } from '../progress.service';
import { FilterSettings, SortColumnType, SortDirectionType, Category } from '../models/data';
import { Moment, utc } from 'moment';
import { FilterService } from '../filter.service';
import { RecordsService } from '../records.service';
import { MatSelectionList } from '@angular/material';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @ViewChild("categoryControl") categoryControl: MatSelectionList

  existingFilters
  filters: (FilterSettings | "new")[];
  selectedFilter: FilterSettings | "new"
  sortDirectionLabel: string
  categories: (Category & { selected: boolean })[];

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

  constructor(
    private dialogRef: MatDialogRef<FilterComponent>,
    private filterService: FilterService,
    private progress: ProgressService,
    private records: RecordsService,
    @Inject(MAT_DIALOG_DATA) private initialFilter: FilterSettings) { }

  ngOnInit() {
    this.progress.executeWithProgress(async () => {
      this.categories = (await this.records.getCategories()).map(x => { return { ...x, selected: true } })
      this.filters = await this.filterService.getFilters()
      this.filters.push("new")
      this.setFilter(this.initialFilter)
    })
  }

  setFilter(filter: FilterSettings | "new") {
    filter = this.filters.filter(p => p != "new" && filter != "new" && p.name == filter.name)[0] || "new"
    this.selectedFilter = filter
    if (filter == "new") {
      this.selectedFilter
      this.changed = true
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
    for (var cat of this.categories) {
      cat.selected = !filter.excludedCategories.includes(cat.name)
    }
  }

  async apply() {
    if (!this.name) {
      return
    }

    const selectedCategories = this.categoryControl.selectedOptions.selected.map(p => p.value)

    for (const category of this.categories) {
      const sel = selectedCategories.includes(category.name)
      if (category.selected != sel) {
        this.changed = true
      }

      category.selected = sel
    }

    const filter = {
      name: this.name,
      sortDirection: this._sortDirection,
      sortColumn: this.sortColumn,
      excludedCategories: this.categories.filter(p => !p.selected).map(p => p.name),
      start: this.start ? this.start.format() : null,
      end: this.end ? this.end.format() : null
    }

    if (this.changed) {
      await this.progress.executeWithProgress(async () => {
        await this.filterService.saveFilter(filter)
      })
    }

    this.dialogRef.close(filter)
  }
}
