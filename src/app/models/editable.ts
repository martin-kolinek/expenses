import { Category, DataRecord, CategoryRule } from "./data";
import { Moment } from "moment";
const randomColor = require('randomcolor')
import { utc } from 'moment'

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
    readonly date: Moment

    constructor(categories: CategoriesContainer, public record: DataRecord) {
        super(categories, record.category)

        this.date = utc(record.date)
    }
}