import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ProgressService } from '../progress.service';
import { anyProperty } from '../models/data';
import { EditableRule } from '../models/editable';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  rules: EditableRule[];
  properties: string[]

  constructor(private data: DataService, private progress: ProgressService) { }

  async ngOnInit() {
    this.properties = this.data.getRecordProperties().concat(anyProperty)
    this.progress.executeWithProgress(async () => {
      this.rules = await this.data.getRules()
    })
  }

  copy(item: EditableRule) {
    const ruleIndex = this.rules.indexOf(item)
    const newRule = item.clone()
    this.rules.splice(ruleIndex, 0, newRule)
  }

  remove(item: EditableRule) {
    this.rules = this.rules.filter(p => p != item)
  }

  async save() {
    this.progress.executeWithProgress(async () => {
      await this.data.setRules(this.rules)
      await this.data.categorize()
    })
  }
}
