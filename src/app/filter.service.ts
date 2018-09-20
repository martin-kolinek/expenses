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
    var filt = (x: EditableRecord) => !filter.excludedCategories.includes(x.category)
    if (filter.start) {
      const start = utc(filter.start)
      filt = x => filt(x) && x.date.isSameOrAfter(start)
    }
    if (filter.end) {
      const end = utc(filter.end)
      filt = x => filt(x) && x.date.isSameOrAfter(end)
    }

    const result = records.filter(filt)

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
}
