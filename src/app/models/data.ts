type DataRecord = {
    date: Date,
    amount: number,
    currency: string,
    contraAccount: string,
    description: string
}

type ExpensesData = {
    records: DataRecord[]
}