import { Injectable } from '@angular/core';
import { DriveService } from './drive.service';
import { Settings } from './models/settings';
import { reject } from 'q';
import { lazy } from './util';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings: Settings
  private user: string
  private loadPromise: Promise<any>
  constructor(private drive: DriveService) {
    try {
      this.createLoadPromise();
    }
    catch (e) {
      reject(e)
    }
  }

  async getSettings(): Promise<Settings> {
    console.log("Loading settings")
    await this.ensureSettings();
    return this.settings
  }

  async addFile(fileName: string, fileId: string) {
    await this.ensureSettings()
    this.settings.dataFiles.push({ id: fileId, name: fileName })

    if (!this.settings.selectedDataFile) {
      this.settings.selectedDataFile = fileId
    }

    await this.saveSettings();
  }

  async changeBaseSettings(selectedFileId: string, forget: string[]) {
    await this.ensureSettings()
    this.settings.dataFiles = this.settings.dataFiles.filter(p => !forget.includes(p.id))

    if (!this.settings.dataFiles.map(p => p.id).includes(selectedFileId)) {
      this.settings.selectedDataFile = this.settings.dataFiles.map(p => p.id)[0]
    }
    else {
      this.settings.selectedDataFile = selectedFileId
    }

    await this.saveSettings();
  }

  async forget(fileId: string) {
    await this.ensureSettings()

    this.settings.dataFiles = this.settings.dataFiles.filter(p => p.id != fileId)

    if (this.settings.selectedDataFile == fileId) {
      this.settings.selectedDataFile = this.settings.dataFiles.map(p => p.id)[0]
    }

    await this.saveSettings()
  }

  async setCurrency(currency: string): Promise<void> {
    await this.ensureSettings()

    this.settings.defaultCurrency = currency

    await this.saveSettings()
  }

  private async saveSettings() {
    await this.drive.saveSettings(this.settings);
  }

  private async ensureSettings() {
    await this.loadPromise;
    const user = (await this.drive.getUserInfo()).id;
    if (this.user != user) {
      this.createLoadPromise();
      await this.loadPromise;
    }
  }

  private createLoadPromise() {
    const defaultSettings = {
      dataFiles: [],
      selectedDataFile: undefined,
      defaultCurrency: "EUR"
    };

    this.loadPromise = lazy(async () => {
      this.user = (await this.drive.getUserInfo()).id;
      const loadedSettings = await this.drive.loadSettings();
      if (loadedSettings) {
        this.settings = loadedSettings as Settings;
        return
      }

      console.log("Using default settings")
      this.settings = defaultSettings;
    });
  }
}
