import { Injectable } from '@angular/core';
import { utc, Moment, min, max } from 'moment'
import { readFile, parseXml } from './util';
import { CurrencyInfo } from './models/data';
import { DataService } from './data.service';

export type CurrencyData = { start: Moment, end: Moment } | null

@Injectable({
  providedIn: 'root'
})
export class ConversionsService {

  constructor(private data: DataService) {
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

    const dayCounts = new Set(keepDates
      .map(p => p.diff(this.beginning(), "days"))
      .map(p => Math.floor(p / 7) * 7))

    const keepKeys = Array.from(dayCounts).map(p => this.beginning().add(p, "days")).map(p => p.format())

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

  async getCurrencyOptions(): Promise<string[]> {
    const range = await this.getCurrentRange()

    if (!range) {
      return []
    }

    const data = await this.data.getData()
    return Object.keys(data.currencies[range.end.format()])
  }
}
