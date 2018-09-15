import { Component, OnInit } from '@angular/core';
import { DriveService } from '../drive.service';
import { SettingsService } from '../settings.service';
import { Settings } from '../models/settings'
import { load } from '@angular/core/src/render3/instructions';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  private toForget: string[]
  userName: string
  settings: Settings
  fileInfo: FileInfo & { name: string } | undefined
  changed: boolean

  get selectedFile(): string {
    return this.settings.selectedDataFile || ""
  }

  set selectedFile(f: string) {
    this.settings.selectedDataFile = f
    this.changed = true
    this.loadSelectedFile()
  }

  constructor(private driveService: DriveService, private settingsService: SettingsService) { }

  async ngOnInit() {
    await this.reload();
    await this.loadSelectedFile()
  }

  async changeUser() {
    await this.driveService.forceSignIn()
    await this.reload()
  }

  async confirm() {
    await this.settingsService.changeSettings(this.settings.selectedDataFile || "", this.toForget)
  }

  forget() {
    this.toForget.push(this.selectedFile)
    this.settings.dataFiles = this.settings.dataFiles.filter(p => p.id != this.selectedFile)
    this.selectedFile = this.settings.dataFiles.map(p => p.id)[0]
    this.changed = true
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
    console.log(JSON.stringify(this.settings))
  }
}
