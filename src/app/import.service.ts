import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  constructor() { }

  private defaultRecord: DataRecord = {
    date: new Date(),
    amount: 0,
    currency: "",
    contraAccount: "",
    description: ""
  }

  getDestinationColumns(): string[] {
    return Object.keys(this.defaultRecord)
  }


}
