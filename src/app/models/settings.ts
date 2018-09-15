export type Settings = {
    dataFiles: DataFile[];
    selectedDataFile: string | undefined
}

export type DataFile = {
    id: string,
    name: string
}