import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProgressService } from '../progress.service';
import { MatSelectChange } from '@angular/material/select';
import { ImportService } from '../import.service';
import { RecordsService } from '../records.service';
import { ImportInfo } from '../models/data';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.css']
})
export class ImportComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  private _selectedEncoding: string = "UTF-8"
  private _skipLines: number = 0
  file: File
  preview: string[]
  selectedColumns: ImportInfo = {}
  outputColumns: string[] = []
  availableColumns: string[] = []
  parseData: import("/home/martin/Work/expenses/src/app/import.service").ParseData;

  get selectedEncoding() {
    return this._selectedEncoding
  }

  set selectedEncoding(enc: string) {
    this._selectedEncoding = enc

    this.read()
  }

  get skipLines() {
    return this._skipLines
  }

  set skipLines(ln: number) {
    this._skipLines = ln

    this.read()
  }

  constructor(private progress: ProgressService, private importService: ImportService, private recordService: RecordsService) { }

  ngOnInit() {
    this.outputColumns = this.recordService.getRecordProperties()
  }

  async upload() {
    const files = this.fileInput.nativeElement.files
    if (!files || !files.length) {
      return
    }

    this.file = files[0]

    await this.read()
  }

  async read() {
    this.progress.executeWithProgress(async () => {
      this.parseData = this.importService.getParseData(this.file, this.selectedEncoding, this.skipLines)

      this.preview = await this.parseData.getPreview()
      this.availableColumns = await this.parseData.getAvailableColumns()
      this.selectedColumns = await this.parseData.getDefaultImportInfo()
    })
  }

  async save() {
    this.progress.executeWithProgress(async () => {
      await this.importService.save(this.parseData, this.selectedColumns)
    })
  }

  selected(event: MatSelectChange, outputColumn: string): void {
    if (!this.selectedColumns[outputColumn]) {
      this.selectedColumns[outputColumn] = []
    }

    if (!this.selectedColumns[outputColumn].includes(event.value))
      this.selectedColumns[outputColumn].push(event.value);
    event.source.value = null
  }

  remove(col: string, outputColumn: string) {
    if (!this.selectedColumns[outputColumn]) {
      return
    }

    const index = this.selectedColumns[outputColumn].indexOf(col)
    if (index >= 0)
      this.selectedColumns[outputColumn].splice(index, 1)
  }
}
