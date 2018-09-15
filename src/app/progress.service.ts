import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  public running: number = 0

  constructor() { }

  async executeWithProgress<T>(func: () => PromiseLike<T>):Promise<T> {
    const wait = new Promise(resolve => setTimeout(resolve, 1000)).then(_ => "wait")
    const promise = func()
    const exec = promise.then(_ => "exec")
    const first = await Promise.race([wait, exec])
    if (first == "exec") {
      console.log("Finished before showing progress")
      return await promise
    }

    this.start()
    const result = await promise
    this.stop()
    return result
  }

  private start() {
    this.running++
  }

  private stop() {
    this.running--
  }
}
