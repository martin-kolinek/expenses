import { Component, OnInit, Input } from '@angular/core';
import { HasCategory } from '../data.service';

@Component({
  selector: 'app-categorypicker',
  templateUrl: './categorypicker.component.html',
  styleUrls: ['./categorypicker.component.css']
})
export class CategorypickerComponent implements OnInit {

  @Input() item: HasCategory

  constructor() { }

  ngOnInit() {
  }

  setCategory(name: string) {
    this.item.category = name
  }

  removeCategory(category: string) {
    this.item.deleteCategory(category)
  }
}
