import { Injectable } from '@angular/core';
import { DriveService } from './drive.service';
import { Settings, DataFile, ImportInfo, FilterSettings } from './models/settings';
import LazyPromise from 'lazy-promise'
import { reject } from 'q';
import { lazy } from './util';
import { hash, codec } from 'sjcl'

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

  async addImportInfo(key: object, importInfo: ImportInfo) {
    await this.ensureSettings()

    const keyHash = this.hashKey(key)

    if (!this.settings.importInfo) {
      this.settings.importInfo = {}
    }

    this.settings.importInfo[keyHash] = importInfo

    await this.saveSettings()
  }

  async getImportInfo(key: object): Promise<ImportInfo> {
    await this.ensureSettings()

    const keyHash = this.hashKey(key)

    if (!this.settings.importInfo) {
      return {}
    }

    const stored = this.settings.importInfo[keyHash]

    if (!stored) {
      return {}
    }
    return stored
  }

  async getFilters(): Promise<FilterSettings[]> {
    await this.ensureSettings()

    if (!this.settings.filters || !Array.isArray(this.settings.filters)) {
      console.log("Abcd " + this.settings.filters)
      this.settings.filters = this.defaultFilters
      console.log("Abcd " + this.settings.filters[0])
    }

    return this.settings.filters
  }

  private hashKey(key: object) {
    return codec.hex.fromBits(hash.sha256.hash(JSON.stringify(key)));
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

  private readonly defaultFilters: FilterSettings[] = [{
    name: "default",
    sortDirection: "desc",
    sortColumn: "date",
    excludedCategories: [],
    start: null,
    end: null
  }];

  private createLoadPromise() {
    const defaultSettings = {
      dataFiles: [],
      selectedDataFile: undefined,
      importInfo: {},
      filters: this.defaultFilters
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
