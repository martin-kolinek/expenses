import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DriveService } from '../drive.service';
import { SettingsService } from '../settings.service';
import { ProgressService } from '../progress.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  fileName = ""
  name = ""

  constructor(
    private route: ActivatedRoute,
    private drive: DriveService,
    private settings: SettingsService,
    private router: Router,
    private progress: ProgressService,
    private data: DataService) { }

  async ngOnInit() {
  }

  async confirm() {
    console.log("confirming")
    if (!this.fileName || !this.name) {
      return
    }

    await this.progress.executeWithProgress(async () => {
      var id = this.route.snapshot.paramMap.get("id")
      if (!id) {
        throw new Error("ID not defined")
      }

      const fileId = await this.drive.createJsonFile(id, this.fileName, this.data.defaultData)
      await this.settings.addFile(this.name, fileId)
      this.router.navigate(["/settings"])
    })
  }

}
