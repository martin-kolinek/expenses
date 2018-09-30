import { Injectable } from '@angular/core';
import { Papa, } from 'ngx-papaparse';
import LazyPromise from 'lazy-promise'
import { lazy, readFile } from './util'
import { PapaParseResult } from 'ngx-papaparse/lib/interfaces/papa-parse-result';
import { utc } from 'moment'
import { DataRecord, unknownCategory, ImportInfo } from './models/data';
import { DataService } from './data.service';
import { codec, hash } from 'sjcl'
import { RecordsService } from './records.service';

export class ParseData {
  private strPromise: Promise<string>
  private linesPromise: Promise<string[]>
  private previewPromise: Promise<string[]>
  private parseResultPromise: LazyPromise<PapaParseResult>;
  private defaultImportInfoPromise: LazyPromise<ImportInfo>;

  constructor(private file: File, private encoding: string, private skipLines: number, private papa: Papa, private service: ImportService) {
    this.strPromise = lazy(() => readFile(file, encoding))

    this.linesPromise = lazy(async () => {
      const str = await this.strPromise
      const result = str.split(/\r?\n/).filter(p => p)
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
      return this.service.getImportInfo(parseResult.meta.fields)
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
      const inputData = {
        date: utc(this.joinField(x, "date", importInfo), "DD.MM.YYYY").format(),
        amount: Number.parseFloat(this.joinField(x, "amount", importInfo).replace(",", ".")),
        currency: this.joinField(x, "currency", importInfo),
        contraAccount: this.joinField(x, "contraAccount", importInfo),
        description: this.joinField(x, "description", importInfo),
      }
      return {
        ...inputData,
        category: unknownCategory,
        userSetCategory: false,
        id: codec.base64.fromBits(hash.sha256.hash(JSON.stringify(inputData))),
        cache: { defaultCurrencyAmount: null }
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

  constructor(private papa: Papa, private data: DataService, private records: RecordsService) { }

  getParseData(input: File, encoding: string, skipLines: number) {
    return new ParseData(input, encoding, skipLines, this.papa, this)
  }

  async save(parseData: ParseData, importInfo: ImportInfo) {
    const newRecords = await parseData.getResult(importInfo)
    await this.records.addRecords(newRecords)
    const availableColumns = await parseData.getAvailableColumns()
    await this.addImportInfo(availableColumns, importInfo)
  }

  async getImportInfo(key: object): Promise<ImportInfo> {
    const data = await this.data.getData()

    const keyHash = this.hashKey(key)

    if (!data.importInfo) {
      return {}
    }

    const stored = data.importInfo[keyHash]

    if (!stored) {
      return {}
    }

    return stored
  }

  private hashKey(key: object) {
    return codec.hex.fromBits(hash.sha256.hash(JSON.stringify(key)));
  }

  private async addImportInfo(key: object, importInfo: ImportInfo) {
    const keyHash = this.hashKey(key)
    await this.data.modifyData(data => {
      if (!data.importInfo) {
        data.importInfo = {}
      }

      data.importInfo[keyHash] = importInfo
    })
  }
}
