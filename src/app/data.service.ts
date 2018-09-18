import { Injectable } from '@angular/core';
import { DriveService } from './drive.service';
import { DataRecord, ExpensesData, unknownCategory, Category, CategoryRule, BasicDataRecord, anyProperty } from './models/data';
import { SettingsService } from './settings.service';
import { Settings } from './models/settings';
import { utc } from 'moment';
const randomColor = require('randomcolor')

export interface HasCategory {
  category: string;
  categoryColor: string;
  readonly availableCategories: Category[]
  deleteCategory(category: string)
}

export class CategoriesContainer {
  constructor(public categories: Category[]) {
  }

  getCategory(name: string) {
    const cat = this.categories.filter(p => p.name == name)[0]
    if (cat) {
      return cat
    }

    const newCategory = {
      name: name,
      color: randomColor()
    }

    this.categories.push(newCategory)

    return newCategory
  }

  deleteCategory(category: string) {
    this.categories = this.categories.filter(p => p.name != category)
  }
}

class ItemWithCategory implements HasCategory {
  constructor(protected categories: CategoriesContainer, categoryName: string) {
    this.category = categoryName
  }

  private _category: Category

  get category(): string {
    return this._category.name
  }

  set category(name: string) {
    this._category = this.categories.getCategory(name)
  }

  get categoryColor() {
    return this._category.color
  }

  set categoryColor(color: string) {
    this._category.color = color
  }

  get availableCategories(): Category[] {
    return this.categories.categories
  }

  deleteCategory(category: string) {
    this.categories.deleteCategory(category)
  }

  createCategories() {
    return this.categories.categories
  }
}

export class EditableRule extends ItemWithCategory {

  constructor(categories: CategoriesContainer, rule: CategoryRule) {
    super(categories, rule.category)
    this.property = rule.property
    this.substring = rule.substring
  }

  property: keyof DataRecord | "any"

  substring: string

  createRule(): CategoryRule {
    return {
      category: this.category,
      property: this.property,
      substring: this.substring
    }
  }

  clone(): EditableRule {
    return new EditableRule(this.categories, this.createRule())
  }
}

export class EditableRecord extends ItemWithCategory {
  constructor(categories: CategoriesContainer, public record: DataRecord) {
    super(categories, record.category)
  }
}

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
    if (!data.settings.selectedDataFile) {
      throw new Error("No selected file")
    }
    await this.drive.updateJsonFile(data.settings.selectedDataFile, data.expenses)
  }

  private async getData(): Promise<{ expenses: ExpensesData, settings: Settings }> {
    const settings = await this.settings.getSettings()

    const defaultData = { records: {}, categories: [], rules: [] }

    if (!settings.selectedDataFile)
      return { expenses: defaultData, settings: settings }

    var data = (await this.drive.loadJsonFile(settings.selectedDataFile)) as ExpensesData

    if (!data || typeof data != "object") {
      return { expenses: defaultData, settings: settings }
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
