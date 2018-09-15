import { Injectable } from '@angular/core';
import { DriveService } from './drive.service';
import { Settings, DataFile } from './models/settings';
import LazyPromise from 'lazy-promise'
import { reject } from 'q';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings: Settings
  private user: string
  private loadPromise: Promise<number>
  constructor(private drive: DriveService) {
    try {
      this.createLoadPromise();
    }
    catch (e) {
      reject(e)
    }
  }

  async getSettings(): Promise<Settings> {
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

  async changeSettings(selectedFileId: string, forget: string[]) {
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
      selectedDataFile: undefined
    };
    this.loadPromise = new LazyPromise<any>(async (resolve, reject) => {
      try {
        const loadedSettings = await this.drive.loadSettings();
        if (loadedSettings) {
          this.settings = loadedSettings as Settings;
          resolve()
          return
        }

        console.log("Using default settings")
        this.settings = defaultSettings;
        this.user = (await this.drive.getUserInfo()).id;
        resolve();
      }
      catch (e) {
        reject(e)
      }
    });
  }
}
