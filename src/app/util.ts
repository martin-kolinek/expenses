import LazyPromise from 'lazy-promise'
import { parseString } from 'xml2js';

export function lazy<T>(func: () => Promise<T>): LazyPromise<T> {
    return new LazyPromise<T>(async (resolve, reject) => {
        try {
            const result = await func();
            resolve(result)
        }
        catch (e) {
            reject(e)
        }
    })
}

export function readFile(file: File, encoding: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = e => reject(e)
        reader.onload = res => {
            if (typeof reader.result == "string") {
                resolve(reader.result)
                return
            }

            reject(new Error("Unexpected read error"))
        }
        reader.readAsText(file, encoding)
    })
}

export function parseXml(input: string): Promise<any> {
    return new Promise((resolve, reject) => {
        parseString(input, (err, res) => {
            if (res) resolve(res)
            else reject(err)
        })
    })
}