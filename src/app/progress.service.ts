import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {

  public running: number = 0

  constructor() { }

  async executeWithProgress(func: () => PromiseLike<any>) {
    this.start()
    await func()
    this.stop()
  }

  private start() {
    this.running++
  }

  private stop() {
    this.running--
  }
}
