import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { load } from '@angular/core/src/render3/instructions';
import { ProgressService } from '../progress.service';
import { MatSelectChange } from '@angular/material/select';
import { ImportService } from '../import.service';

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
  selectedColumns: { [columnName: string]: string[] } = {}
  outputColumns: string[] = []
  availableColumns: string[] = ["a", "b", "c"]

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

  constructor(private progress: ProgressService, private importService: ImportService) { }

  ngOnInit() {
    this.outputColumns = this.importService.getDestinationColumns()
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
      const str = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = e => reject(e)
        reader.onload = res => {
          if (typeof reader.result == "string") {
            resolve(reader.result)
          }

          reject(new Error("Unexpected read error"))
        }
        reader.readAsText(this.file, this.selectedEncoding)
      })

      const lines = str.split(/\r?\n/).filter(p => p)
      lines.splice(0, this.skipLines)
      this.preview = [
        lines[0],
        lines[1],
        lines[2],
        lines[3]
      ]
      console.log(str)
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
