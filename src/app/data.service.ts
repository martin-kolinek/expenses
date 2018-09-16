import { Injectable } from '@angular/core';
import { DriveService } from './drive.service';
import { DataRecord, ExpensesData } from './models/data';
import { SettingsService } from './settings.service';
import { Settings } from './models/settings';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private drive: DriveService, private settings: SettingsService) { }

  async getRecords(): Promise<DataRecord[]> {
    return (await this.getData()).expenses.records
  }

  async addRecords(records: DataRecord[]) {
    const data = await this.getData()

    data.expenses.records = data.expenses.records.concat(records)

    if (!data.settings.selectedDataFile)
      throw new Error("Attempt to save without file")

    await this.drive.updateJsonFile(data.settings.selectedDataFile, data.expenses)
  }

  private async getData(): Promise<{ expenses: ExpensesData, settings: Settings }> {
    const settings = await this.settings.getSettings()

    const defaultData = { records: [] }

    if (!settings.selectedDataFile)
      return { expenses: defaultData, settings: settings }

    var data = (await this.drive.loadJsonFile(settings.selectedDataFile)) as ExpensesData

    if (!data || typeof data != "object") {
      return { expenses: defaultData, settings: settings }
    }

    return { expenses: data, settings: settings }
  }
}
