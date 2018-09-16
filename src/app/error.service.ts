import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private injector: Injector) { }

  handleError(error) {
    this.injector.get(ErrorService).postError()

    //throw error;
  }

}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  private _obs: Subject<void> = new Subject<void>()

  get errors(): Observable<void> {
    return this._obs;
  }

  postError() {
    this._obs.next()
  }

  constructor() {
  }
}
