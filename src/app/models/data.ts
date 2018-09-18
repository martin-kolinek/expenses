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
    rules: CategoryRule[]
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

export const unknownCategory = "unkwnown"
export const anyProperty = "any"