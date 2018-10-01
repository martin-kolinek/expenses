import { Component, OnInit, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { FilterResult, EditableRecord, FilterResultItem } from '../models/editable';
import { FilterShellComponent } from '../filter-shell/filter-shell.component';

@Component({
  selector: 'app-extended-filter-shell',
  templateUrl: './extended-filter-shell.component.html',
  styleUrls: ['./extended-filter-shell.component.css']
})
export class ExtendedFilterShellComponent implements OnInit {

  constructor() { }

  @ViewChild("shell") shell: FilterShellComponent

  selectedPeriod: FilterResultItem
  filterResult: FilterResult

  @Input()
  get title() {
    return this.shell.title
  }
  set title(t: string) {
    this.shell.title = t
  }

  @Output() recordsChanged = new EventEmitter<EditableRecord[]>()
  @Output() defaultCurrencyChanged = new EventEmitter<string>()

  ngOnInit() {
  }

  recordsChangedHandler(res: FilterResult) {
    this.filterResult = res
    console.log(res.length)
    const newSelected = this.selectedPeriod ? this.filterResult.filter(x => x.period == this.selectedPeriod.period) : []
    if (newSelected.length) {
      this.periodSelected(newSelected[0])
    }
    else {
      this.periodSelected(this.filterResult[this.filterResult.length - 1])
    }
  }

  periodSelected(period: FilterResultItem) {
    this.selectedPeriod = period
    const index = this.filterResult.indexOf(period)
    this.recordsChanged.emit(this.filterResult[index].records)
  }

  previous() {
    var index = this.filterResult.indexOf(this.selectedPeriod)
    index--
    if (index >= 0) {
      this.periodSelected(this.filterResult[index])
    }
  }

  next() {
    var index = this.filterResult.indexOf(this.selectedPeriod)
    index++
    if (index < this.filterResult.length) {
      this.periodSelected(this.filterResult[index])
    }
  }
}
