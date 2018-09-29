export type Settings = {
    dataFiles: DataFile[],
    selectedDataFile: string | undefined,
    defaultCurrency: string
}

export type DataFile = {
    id: string,
    name: string
}