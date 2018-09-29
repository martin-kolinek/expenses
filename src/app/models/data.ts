import { Moment } from "moment";

export type BasicDataRecord = {
    date: string,
    amount: number,
    currency: string,
    contraAccount: string,
    description: string,
}

export type DataRecord = BasicDataRecord & {
    category: string,
    userSetCategory: boolean,
    id: string
}

export type ExpensesData = {
    records: { [id: string]: DataRecord }
    categories: Category[]
    rules: CategoryRule[],
    importInfo: { [key: string]: ImportInfo },
    filters: { [name: string]: FilterSettings }
    currencies: { [date: string]: CurrencyInfo }
}

export type Category = {
    name: string,
    color: string,
}

export type CategoryRule = {
    category: string,
    property: keyof DataRecord | "any",
    substring: string
}

export type CurrencyInfo = {
    [currency: string]: number
}

export const unknownCategory = "unkwnown"
export const anyProperty = "any"

export type SortColumnType = "date" | "amount"

export type SortDirectionType = "asc" | "desc"

export type FilterSettings = {
    name: string
    sortDirection: "asc" | "desc"
    sortColumn: "date" | "amount"
    excludedCategories: string[]
    start: string | null,
    end: string | null
}

export type ImportInfo = {
    [column: string]: string[]
}