import LazyPromise from 'lazy-promise'

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