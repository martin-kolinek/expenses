import { Injectable } from '@angular/core';
import { Papa, } from 'ngx-papaparse';
import LazyPromise from 'lazy-promise'
import { lazy } from './util'
import { PapaParseResult } from 'ngx-papaparse/lib/interfaces/papa-parse-result';
import { utc } from 'moment'
import { DataRecord, ExpensesData } from './models/data';
import { DriveService } from './drive.service';
import { SettingsService } from './settings.service';

export type ImportInfo = {
  [column: string]: string[]
}

export class ParseData {
  private strPromise: Promise<string>
  private linesPromise: Promise<string[]>
  private previewPromise: Promise<string[]>
  private parseResultPromise: LazyPromise<PapaParseResult>;

  constructor(private file: File, private encoding: string, private skipLines: number, private papa: Papa) {
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
      return str.split(/\r?\n/).filter(p => p)
    })

    this.previewPromise = lazy(async () => {
      const lines = await this.linesPromise
      return lines.slice(0, 4)
    })

    this.parseResultPromise = lazy(async () => {
      const lines = await this.linesPromise
      return this.papa.parse(lines.join("\n"), { header: true })
    })
  }

  getPreview() {
    return this.previewPromise
  }

  async getAvailableColumns() {
    const result = await this.parseResultPromise

    return result.meta.fields
  }

  async getResult(importInfo: ImportInfo): Promise<DataRecord[]> {
    const result = await this.parseResultPromise
    return (result.data as object[]).map(x => {
      return {
        date: utc(this.joinField(x, "date", importInfo), "DD.MM.YYYY").format(),
        amount: Number.parseFloat(this.joinField(x, "amount", importInfo)),
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

  constructor(private papa: Papa, private drive: DriveService, private settings: SettingsService) { }

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
    return new ParseData(input, encoding, skipLines, this.papa)
  }

  async save(parseData: ParseData, importInfo: ImportInfo) {
    const settings = await this.settings.getSettings()
    if (!settings.selectedDataFile) {
      console.log("No file selected")
      return
    }
    var currentData = (await this.drive.loadJsonFile(settings.selectedDataFile)) as ExpensesData
    console.log("before " + typeof currentData)
    if (!currentData || typeof currentData != "object") {
      currentData = { records: [] }
    }
    if (!currentData.records || !Array.isArray(currentData.records)) {
      currentData.records = []
    }
    const newRecords = await parseData.getResult(importInfo)
    console.log("new " + JSON.stringify(newRecords))
    currentData.records = currentData.records.concat(newRecords)

    console.log("after " + JSON.stringify(currentData))

    await this.drive.updateJsonFile(settings.selectedDataFile, currentData)
  }
}
