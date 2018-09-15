import { Moment } from "moment";

export type DataRecord = {
    date: string,
    amount: number,
    currency: string,
    contraAccount: string,
    description: string
}

export type ExpensesData = {
    records: DataRecord[]
}