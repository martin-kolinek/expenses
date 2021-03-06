import { Injectable } from '@angular/core';
import { EditableRecord, FilterResult } from './models/editable';
import { FilterSettings } from './models/data';
import { utc } from 'moment'
import { DataService } from './data.service';
import * as _ from 'lodash'

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor(private data: DataService) { }

  async getFilters(): Promise<FilterSettings[]> {
    const data = await this.data.getData()

    if (!data || !data.filters || !Object.values(data.filters)) {
      return [this.defaultFilter]
    }

    return Object.values(data.filters).slice()
  }

  async saveFilter(filter: FilterSettings) {
    await this.data.modifyData(data => {
      if (!data.filters) {
        data.filters = {}
        data.filters[this.defaultFilter.name] = this.defaultFilter
      }

      data.filters[filter.name] = filter
    })
  }

  private readonly defaultFilter: FilterSettings = {
    name: "default",
    sortDirection: "desc",
    sortColumn: "date",
    excludedCategories: [],
    start: null,
    end: null
  };

  filterRecords(records: EditableRecord[], filter: FilterSettings): FilterResult {
    const result = records.filter(x => this.filterRecord(x, filter))

    result.sort((a, b) => {
      var mult = -1
      if (filter.sortDirection == "desc") {
        mult = 1
      }

      if (filter.sortColumn == "date") {
        if (a.date.isBefore(b.date)) {
          return mult
        }
        else if (a.date.isSame(b.date)) {
          return 0
        }
        else {
          return -mult
        }
      }

      if (filter.sortColumn == "amount") {
        return mult * (b.record.amount - a.record.amount)
      }

      return 0
    })

    return _.chain(result)
      .groupBy(x => x.record.date.substr(0, 7))
      .map((v, k) => {
        return {
          period: utc(k, "YYYY-MM"),
          records: v
        }
      })
      .orderBy(p => p.period)
      .map(x => {
        return {
          period: x.period.format("MMM YYYY"),
          records: x.records
        }
      })
      .value()
  }

  private filterRecord(record: EditableRecord, filter: FilterSettings) {
    if (filter.excludedCategories.includes(record.category)) return false
    if (filter.start && utc(filter.start).isAfter(record.date)) return false
    if (filter.end && utc(filter.end).isBefore(record.date)) return false
    return true
  }
}
