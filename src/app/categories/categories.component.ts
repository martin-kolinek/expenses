import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {

  constructor(private data: DataService) { }

  ngOnInit() {
  }

  async test() {
    await this.data.getRecords()
    throw new Error("something")
  }

}
