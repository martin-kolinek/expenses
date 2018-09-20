export type Settings = {
    dataFiles: DataFile[],
    selectedDataFile: string | undefined,
    importInfo: { [key: string]: ImportInfo },
    filters: FilterSettings[]
}

export type DataFile = {
    id: string,
    name: string
}

export type ImportInfo = {
    [column: string]: string[]
}

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