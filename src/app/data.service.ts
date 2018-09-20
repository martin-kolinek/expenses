import { Injectable } from '@angular/core';
import { DriveService } from './drive.service';
import { DataRecord, ExpensesData, unknownCategory, Category, CategoryRule, BasicDataRecord, anyProperty } from './models/data';
import { SettingsService } from './settings.service';
import { Settings } from './models/settings';
import { utc } from 'moment';
import { EditableRecord, EditableRule, CategoriesContainer } from './models/editable';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private drive: DriveService, private settings: SettingsService) { }

  async getRecords(): Promise<EditableRecord[]> {
    const data = await this.getData()
    const records = Object.values(data.expenses.records)
    const categoryContainer = this.getCategoryContainer(data)

    return records.map(p => new EditableRecord(categoryContainer, p))
  }

  async addRecords(records: DataRecord[]) {
    const data = await this.getData()

    for (var record of records) {
      data.expenses.records[record.id] = record
    }

    if (!data.settings.selectedDataFile)
      throw new Error("Attempt to save without file")

    await this.drive.updateJsonFile(data.settings.selectedDataFile, data.expenses)
  }

  async getRules() {
    const data = await this.getData()

    var rules = data.expenses.rules
    const categoryContainer = this.getCategoryContainer(data);

    if (!rules || !Array.isArray(rules)) {
      console.log("Empty rules")
      rules = []
    }

    if (!rules.filter(p => p.category == unknownCategory).length) {
      rules.push({
        category: unknownCategory,
        property: anyProperty,
        substring: ""
      })
      console.log("Adding rule")
    }

    console.log("Rules " + typeof rules)
    return rules.map(p => new EditableRule(categoryContainer, p))
  }

  private defaultRecord: BasicDataRecord = {
    date: utc().format(),
    amount: 0,
    currency: "",
    contraAccount: "",
    description: ""
  }

  getRecordProperties(): string[] {
    return Object.keys(this.defaultRecord)
  }

  async setRules(rules: EditableRule[]) {
    if (!rules.length) {
      return
    }

    const categories = rules[0].createCategories()
    const dataRules = rules.map(p => p.createRule())

    const data = await this.getData()
    data.expenses.categories = categories
    data.expenses.rules = dataRules
    await this.saveData(data);
  }

  async categorize() {
    const data = await this.getData()
    for (var id in data.expenses.records) {
      const record = data.expenses.records[id]

      for (var rule of data.expenses.rules) {
        if (!record.userSetCategory && this.matches(rule, record)) {
          record.category = rule.category
          break;
        }
      }
    }

    await this.saveData(data)
  }

  private matches(rule: CategoryRule, record: DataRecord) {
    for (var property in this.defaultRecord) {
      if ((property == rule.property || rule.property == anyProperty) && record[property].toString().toLowerCase().includes(rule.substring.toLowerCase())) {
        return true
      }
    }

    return false
  }

  private async saveData(data: { expenses: ExpensesData; settings: Settings; }) {
    if (!data.settings.selectedDataFile) {
      throw new Error("No selected file");
    }
    await this.drive.updateJsonFile(data.settings.selectedDataFile, data.expenses);
  }

  readonly defaultData: ExpensesData = { records: {}, categories: [], rules: [] }

  private async getData(): Promise<{ expenses: ExpensesData, settings: Settings }> {
    const settings = await this.settings.getSettings()


    if (!settings.selectedDataFile)
      return { expenses: this.defaultData, settings: settings }

    var data = (await this.drive.loadJsonFile(settings.selectedDataFile)) as ExpensesData

    if (!data || typeof data != "object") {
      return { expenses: this.defaultData, settings: settings }
    }

    return { expenses: data, settings: settings }
  }

  private getCategoryContainer(data: { expenses: ExpensesData; settings: Settings; }) {
    const categories = data.expenses.categories || [];
    if (!categories.filter(p => p.name == unknownCategory).length) {
      categories.push({
        color: "#888888",
        name: unknownCategory
      });
    }
    const categoryContainer = new CategoriesContainer(categories);
    return categoryContainer;
  }
}
