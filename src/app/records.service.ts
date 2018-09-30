import { Injectable } from '@angular/core';
import { ExpensesData, unknownCategory, CategoryRule, DataRecord, anyProperty, BasicDataRecord, ImportInfo, FilterSettings, Category } from './models/data';
import { CategoriesContainer, EditableRecord, EditableRule } from './models/editable';
import { utc } from 'moment';
import { DataService } from './data.service';
import { ConversionsService } from './conversions.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class RecordsService {

  constructor(private data: DataService, private conversions: ConversionsService, private settings: SettingsService) { }

  async getRecords(): Promise<EditableRecord[]> {
    const data = await this.data.getData()
    const settings = await this.settings.getSettings()
    const records = Object.values(data.records)
    const categoryContainer = this.getCategoryContainer(data)

    return records.map(p => new EditableRecord(categoryContainer, p))
  }

  async addRecords(records: DataRecord[]) {
    const currency = (await this.settings.getSettings()).defaultCurrency
    await this.data.modifyData(data => {
      for (var record of records) {
        data.records[record.id] = record
      }

      this.categorize(data)
      this.conversions.convert(data, currency)
    })
  }

  async getRules() {
    const data = await this.data.getData()

    var rules = data.rules
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

    await this.data.modifyData(data => {
      data.categories = categories
      data.rules = dataRules

      this.categorize(data)
    })
  }

  private categorize(data: ExpensesData) {
    for (var id in data.records) {
      const record = data.records[id]

      for (var rule of data.rules) {
        if (!record.userSetCategory && this.matches(rule, record)) {
          record.category = rule.category
          break;
        }
      }
    }
  }

  async getCategories(): Promise<Category[]> {
    const data = await this.data.getData()
    return this.getCategoryContainer(data).categories
  }

  private getCategoryContainer(expenses: ExpensesData): CategoriesContainer {
    const categories = expenses.categories || [];
    if (!categories.filter(p => p.name == unknownCategory).length) {
      categories.push({
        color: "#888888",
        name: unknownCategory
      });
    }
    const categoryContainer = new CategoriesContainer(categories);
    return categoryContainer;
  }

  private matches(rule: CategoryRule, record: DataRecord) {
    for (var property in this.defaultRecord) {
      if ((property == rule.property || rule.property == anyProperty) && record[property].toString().toLowerCase().includes(rule.substring.toLowerCase())) {
        return true
      }
    }

    return false
  }
}
