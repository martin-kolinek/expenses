import { Injectable } from '@angular/core';
import LazyPromise from 'lazy-promise'
import { environment } from '../environments/environment'
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DriveService {

  private signInPromise: LazyPromise<{}>;
  private loadPromise;

  constructor(private http: HttpClient) {
    this.loadPromise = new Promise((resolve, reject) => {
      gapi.load("client:auth2", () => resolve());
    })

    this.signInPromise = new LazyPromise(async (resolve, reject) => {
      try {
        await this.loadPromise
        await gapi.client.init({
          clientId: environment.googleClientId,
          scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install"
        })

        await gapi.auth2.getAuthInstance().signIn();

        await gapi.client.load("drive", "v2")

        resolve({});
      }
      catch (e) {
        reject(e)
      }
    })
  }

  private getAuthHeader() {
    return `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`;
  }

  async saveSettings(settings: Object) {
    await this.signInPromise;

    const baseRoot = gapi['config'].get('googleapis.config').root;

    const authHeader = this.getAuthHeader()

    const metadataHeaders = {
      "Authorization": authHeader,
      "Content-Type": "application/json",
      "X-Upload-Content-Type": "application/json"
    };

    const metadata = {
      "title": "settings.json",
      "parents": [{ id: 'appDataFolder' }]
    };


    const url = `${baseRoot}/upload/drive/v2/files?uploadType=resumable`;

    var metadataResponse = await this.http.post(url, metadata, { observe: "response", headers: new HttpHeaders(metadataHeaders) }).toPromise()
    if (!metadataResponse.ok) {
      throw metadataResponse.body
    }
    var location = metadataResponse.headers.get("Location")

    if (location == null) {
      throw "No location header in POST response"
    }

    await this.http.put(location, settings, { headers: new HttpHeaders({ "Content-Type": "application/json", }) }).toPromise()

    console.log("Saved settings")
  }

  async loadSettings(): Promise<Object | undefined> {
    await this.signInPromise

    var settingsFiles = await gapi.client.drive.files.list({
      spaces: "appDataFolder",
      q: "title = 'settings.json'"
    })

    const settingsFile = settingsFiles.result.items[0]
    if (!settingsFile) {
      console.log("No settings file found")
      return undefined
    }

    var settings = await this.http.get(settingsFile.downloadUrl, { headers: new HttpHeaders({ "Authorization": this.getAuthHeader() }) }).toPromise()

    console.log(`Loaded settings ${JSON.stringify(settings)}`)

    return settings;
  }
}
