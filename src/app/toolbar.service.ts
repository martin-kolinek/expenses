import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {

  template: TemplateRef<any>

  constructor() { }
}
