import { Injectable } from '@angular/core';
import { Papa, } from 'ngx-papaparse';
import LazyPromise from 'lazy-promise'
import { lazy } from './util'
import { PapaParseResult } from 'ngx-papaparse/lib/interfaces/papa-parse-result';
import { utc } from 'moment'
import { DataRecord } from './models/data';
import { DataService } from './data.service';
import { ImportInfo } from './models/settings';
import { SettingsService } from './settings.service';

export class ParseData {
  private strPromise: Promise<string>
  private linesPromise: Promise<string[]>
  private previewPromise: Promise<string[]>
  private parseResultPromise: LazyPromise<PapaParseResult>;
  private defaultImportInfoPromise: LazyPromise<ImportInfo>;

  constructor(private file: File, private encoding: string, private skipLines: number, private papa: Papa, private settings: SettingsService) {
    this.strPromise = new LazyPromise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = e => reject(e)
      reader.onload = res => {
        if (typeof reader.result == "string") {
          resolve(reader.result)
        }

        reject(new Error("Unexpected read error"))
      }
      reader.readAsText(file, encoding)
    })

    this.linesPromise = lazy(async () => {
      const str = await this.strPromise
      const result =  str.split(/\r?\n/).filter(p => p)
      result.splice(0, this.skipLines)
      return result
    })

    this.previewPromise = lazy(async () => {
      const lines = await this.linesPromise
      return lines.slice(0, 4)
    })

    this.parseResultPromise = lazy(async () => {
      const lines = await this.linesPromise
      return this.papa.parse(lines.join("\n"), { header: true })
    })

    this.defaultImportInfoPromise = lazy(async () => {
      const parseResult = await this.parseResultPromise
      return this.settings.getImportInfo(parseResult.meta.fields)
    })
  }

  getPreview() {
    return this.previewPromise
  }

  async getAvailableColumns() {
    const result = await this.parseResultPromise

    return result.meta.fields
  }

  getDefaultImportInfo() {
    return this.defaultImportInfoPromise
  }

  async getResult(importInfo: ImportInfo): Promise<DataRecord[]> {
    const result = await this.parseResultPromise
    return (result.data as object[]).map(x => {
      return {
        date: utc(this.joinField(x, "date", importInfo), "DD.MM.YYYY").format(),
        amount: Number.parseFloat(this.joinField(x, "amount", importInfo).replace(",", ".")),
        currency: this.joinField(x, "currency", importInfo),
        contraAccount: this.joinField(x, "contraAccount", importInfo),
        description: this.joinField(x, "description", importInfo),
      }
    })
  }

  private joinField(data: object, fieldName: string, inputs: ImportInfo) {
    if (!inputs[fieldName]) {
      return ""
    }
    return inputs[fieldName].map(p => data[p]).join(" ")
  }
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  constructor(private papa: Papa, private dataService: DataService, private settings: SettingsService) { }

  private defaultRecord: DataRecord = {
    date: utc().format(),
    amount: 0,
    currency: "",
    contraAccount: "",
    description: ""
  }

  getDestinationColumns(): string[] {
    return Object.keys(this.defaultRecord)
  }

  getParseData(input: File, encoding: string, skipLines: number) {
    return new ParseData(input, encoding, skipLines, this.papa, this.settings)
  }

  async save(parseData: ParseData, importInfo: ImportInfo) {
    const newRecords = await parseData.getResult(importInfo)
    await this.dataService.addRecords(newRecords)
    const availableColumns = await parseData.getAvailableColumns()
    await this.settings.addImportInfo(availableColumns, importInfo)
  }
}
