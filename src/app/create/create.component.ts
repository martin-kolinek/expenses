import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DriveService } from '../drive.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  fileName = ""

  constructor(private route: ActivatedRoute, private drive: DriveService) { }

  async ngOnInit() {
  }

  async confirm() {
    console.log("confirming")
    if(!this.fileName) {
      return
    }

    var id = this.route.snapshot.paramMap.get("id")
    if(!id) {
      throw new Error("ID not defined")
    }

    await this.drive.saveJsonFile(id, this.fileName, {test: "casdf"})
  }

}
