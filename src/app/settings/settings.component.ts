import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment'
import { DriveService } from '../drive.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(private driveService: DriveService) { }

  ngOnInit() {
  }

  async loadClick() {
    await this.driveService.loadSettings();
  }

  async saveClick() {
    await this.driveService.saveSettings({ fileIds: ["asdf"], selectedFile: "asdf" });
  }
}
