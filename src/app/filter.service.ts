import { Injectable } from '@angular/core';
import { EditableRecord } from './models/editable';
import { FilterSettings } from './models/settings';
import { utc } from 'moment'

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  constructor() { }

  filterRecords(records: EditableRecord[], filter: FilterSettings): EditableRecord[] {
    const result = records.filter(x => this.filterRecord(x, filter))

    result.sort((a, b) => {
      var mult = 1
      if (filter.sortDirection == "desc") {
        mult = -1
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

    return result
  }

  private filterRecord(record: EditableRecord, filter: FilterSettings) {
    if (filter.excludedCategories.includes(record.category)) return false
    if (filter.start && utc(filter.start).isAfter(record.date)) return false
    if (filter.end && utc(filter.end).isBefore(record.date)) return false
    return true
  }
}
