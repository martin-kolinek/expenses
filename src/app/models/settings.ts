export type Settings = {
    dataFiles: DataFile[],
    selectedDataFile: string | undefined,
    importInfo: { [key: string]: ImportInfo }
}

export type DataFile = {
    id: string,
    name: string
}

export type ImportInfo = {
    [column: string]: string[]
}