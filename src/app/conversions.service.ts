import { Injectable } from '@angular/core';
import { utc, Moment, min, max } from 'moment'
import { readFile, parseXml } from './util';
import { CurrencyInfo, DataRecord, ExpensesData } from './models/data';
import { DataService } from './data.service';
import { SettingsService } from './settings.service';

export type CurrencyData = { start: Moment, end: Moment } | null

@Injectable({
  providedIn: 'root'
})
export class ConversionsService {

  constructor(private data: DataService, private settings: SettingsService) {
  }

  private beginning() {
    return utc(0)
  }

  async uploadCurrencies(file: File, minDate: Moment | null) {

    const xml = await readFile(file, "utf-8")

    const doc = new DOMParser().parseFromString(xml, "application/xml")
    const resolver = doc.createNSResolver(doc)
    const result = doc.evaluate("/gesmes:Envelope/*/*[@time]", doc, resolver, XPathResult.ANY_TYPE, null)

    var timeNode = result.iterateNext() as Element
    const currencyData: { [date: string]: CurrencyInfo } = {}

    while (timeNode) {
      const curInfo: CurrencyInfo = { "EUR": 1 }

      const childNodes = doc.evaluate("*[@currency and @rate]", timeNode, resolver, XPathResult.ANY_TYPE, null)
      var childNode = childNodes.iterateNext() as Element

      while (childNode) {
        const currency = childNode.getAttribute("currency")
        const rateStr = childNode.getAttribute("rate")
        if (currency && rateStr) {
          const rate = parseFloat(rateStr)

          if (rate) {
            curInfo[currency] = rate
          }
        }

        childNode = childNodes.iterateNext() as Element
      }

      const timeStr = timeNode.getAttribute("time")
      if (timeStr && Object.keys(curInfo).length > 1) {
        const time = utc(timeStr)
        if (time) {
          currencyData[time.format()] = curInfo
        }
      }

      timeNode = result.iterateNext() as Element
    }

    const keepDates = Object.keys(currencyData)
      .map(p => utc(p))
      .filter(p => !minDate || !minDate.isAfter(p))

    const keepKeys = Array.from(new Set(keepDates.map(p => this.dateKey(p))))

    this.data.modifyData(data => {
      if (!data.currencies) {
        data.currencies = {}
      }

      for (const k of keepKeys) {
        data.currencies[k] = currencyData[k]
      }
    })
  }

  async getCurrentRange(): Promise<CurrencyData> {
    const data = await this.data.getData()

    return this.getRangeFromData(data)
  }

  async getCurrencyOptions(): Promise<string[]> {
    const range = await this.getCurrentRange()

    if (!range) {
      return []
    }

    const data = await this.data.getData()
    return Object.keys(data.currencies[range.end.format()])
  }

  convert(record: DataRecord, currency: string, data: ExpensesData): number | null {
    const date = utc(record.date)
    const key = this.dateKey(date)

    const keyDate = utc(key)

    const range = this.getRangeFromData(data)
    if (!range) {
      return null
    }

    const curInfo = data.currencies[key]

    if (curInfo) {
      return this.convertUsing(record, currency, curInfo)
    }

    // A lazy solution without searching for the best key - will work as long as there are no holes in currency data
    if (keyDate.isBefore(range.start)) {
      return this.convertUsing(record, currency, data.currencies[range.start.format()])
    }

    return this.convertUsing(record, currency, data.currencies[range.end.format()])
  }

  private convertUsing(record: DataRecord, currency: string, curInfo: CurrencyInfo): number | null {
    const destRate = curInfo[currency || record.currency]
    const srcRate = curInfo[record.currency]

    if (!destRate || !srcRate) {
      return null
    }

    return (record.amount / srcRate) * destRate
  }

  private dateKey(date: Moment): string {
    const daysFromBeginning = date.diff(this.beginning(), "days")
    const keyDays = Math.floor(daysFromBeginning / 7) * 7
    return this.beginning().add(keyDays, "days").format()
  }

  private getRangeFromData(data: ExpensesData) {
    if (!data || !data.currencies) {
      return null
    }

    const dates = Object.keys(data.currencies).map(p => utc(p))

    if (!dates.length) {
      return null
    }

    return {
      start: min(dates),
      end: max(dates)
    }
  }
}
