import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DriveService } from '../drive.service';
import { SettingsService } from '../settings.service';
import { Settings } from '../models/settings'
import { load } from '@angular/core/src/render3/instructions';
import { ProgressService } from '../progress.service';
import { ConversionsService, CurrencyData } from '../conversions.service';
import { Moment } from 'moment';
import { MatExpansionPanel } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @ViewChild('currencyInput') currencyInput: ElementRef<HTMLInputElement>;
  @ViewChild('currencyUpload') currencyUpload: MatExpansionPanel

  private toForget: string[]
  userName: string
  settings: Settings
  fileInfo: FileInfo & { name: string } | undefined
  changed: boolean
  currencyData: CurrencyData
  currencyMinDate: Moment | null;
  currencies: any;

  get selectedFile(): string {
    return this.settings.selectedDataFile || ""
  }

  set selectedFile(f: string) {
    this.progress.executeWithProgress(async () => {
      this.settings.selectedDataFile = f
      this.changed = true
      this.loadSelectedFile()
    })
  }

  constructor(
    private driveService: DriveService,
    private settingsService: SettingsService,
    private progress: ProgressService,
    private conversions: ConversionsService) { }

  async ngOnInit() {
    this.progress.executeWithProgress(async () => {
      await this.reload();
    })
  }

  async changeUser() {
    this.progress.executeWithProgress(async () => {
      await this.driveService.forceSignIn()
      await this.reload()
    })
  }

  async confirm() {
    this.progress.executeWithProgress(async () => {
      await this.settingsService.changeBaseSettings(this.settings.selectedDataFile || "", this.toForget)
    })
  }

  forget() {
    this.toForget.push(this.selectedFile)
    this.settings.dataFiles = this.settings.dataFiles.filter(p => p.id != this.selectedFile)
    this.selectedFile = this.settings.dataFiles.map(p => p.id)[0]
    this.changed = true
  }

  async uploadCurrencies() {
    const files = this.currencyInput.nativeElement.files
    if (files && files.length) {
      await this.progress.executeWithProgress(async () => {
        await this.conversions.uploadCurrencies(files[0], this.currencyMinDate)
        await this.loadCurrencyData()
      })
    }

    this.currencyUpload.close()
  }

  async setCurrency(currency: string) {
    await this.progress.executeWithProgress(async () => {
      await this.conversions.setCurrency(currency)
    })
  }

  private async loadSelectedFile() {
    if (!this.settings.selectedDataFile) {
      this.fileInfo = undefined
      return
    }

    const fileInfo = await this.driveService.loadFileInfo(this.settings.selectedDataFile)
    const name = this.settings.dataFiles.filter(p => p.id == this.settings.selectedDataFile).map(p => p.name)[0]
    this.fileInfo = { ...fileInfo, name: name }
    console.log(`Found fileInfo ${JSON.stringify(this.fileInfo)}`)
  }

  private async reload() {
    this.userName = (await this.driveService.getUserInfo()).name;
    this.settings = await this.settingsService.getSettings()
    this.toForget = []
    await this.loadSelectedFile()
    await this.loadCurrencyData()
    console.log(JSON.stringify(this.settings))
  }

  private async loadCurrencyData() {
    this.currencyData = await this.conversions.getCurrentRange()
    this.currencies = await this.conversions.getCurrencyOptions()
  }
}
