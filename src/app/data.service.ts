import { Injectable } from '@angular/core';
import { DriveService } from './drive.service';
import { ExpensesData } from './models/data';
import { SettingsService } from './settings.service';
import { Settings } from './models/settings';
import { lazy } from './util';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  dataPromise: Promise<ExpensesData>

  constructor(private drive: DriveService, private settings: SettingsService) {
    this.refresh()
  }

  refresh() {
    this.dataPromise = lazy(async () => {
      const settings = await this.settings.getSettings()

      if (!settings.selectedDataFile)
        return this.defaultData

      var data = (await this.drive.loadJsonFile(settings.selectedDataFile)) as ExpensesData

      if (!data || typeof data != "object") {
        return this.defaultData
      }

      return data
    })
  }

  getData(): Promise<ExpensesData> {
    return this.dataPromise
  }

  async modifyData(modification: (x: ExpensesData) => void): Promise<void> {
    this.refresh()

    const data = await this.dataPromise

    modification(data)

    const settings = await this.settings.getSettings()

    if (!settings.selectedDataFile) {
      throw new Error("No selected file");
    }
    await this.drive.updateJsonFile(settings.selectedDataFile, data);
  }

  readonly defaultData: ExpensesData = { records: {}, categories: [], rules: [], importInfo: {}, filters: {}, currencies: {} }
}
