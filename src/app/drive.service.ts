import { Injectable } from '@angular/core';
import LazyPromise from 'lazy-promise'
import { environment } from '../environments/environment'
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

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
          scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive.appfolder"
        })

        if (!gapi.auth2.getAuthInstance().isSignedIn) {
          await gapi.auth2.getAuthInstance().signIn();
        }

        await gapi.client.load("drive", "v2")

        resolve({});
      }
      catch (e) {
        reject(e)
      }
    })
  }

  private getAuthHeaders() {
    return new HttpHeaders({ "Authorization": `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}` });
  }

  private getUploadUrl(suffix = "") {
    const baseRoot = gapi['config'].get('googleapis.config').root;
    return `${baseRoot}/upload/drive/v2/files${suffix}?uploadType=resumable`;
  }

  async getUserInfo(): Promise<{ name: string, id: string }> {
    await this.signInPromise

    const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()

    return {
      name: profile.getName(),
      id: profile.getId()
    }
  }

  async forceSignIn() {
    await this.signInPromise

    await gapi.auth2.getAuthInstance().signIn()
  }

  private async getSettingsFile() {
    var settingsFiles = await gapi.client.drive.files.list({
      spaces: "appDataFolder",
      q: "title = 'settings.json'"
    });
    const settingsFile = settingsFiles.result.items[0];
    return settingsFile;
  }

  async saveSettings(settings: Object) {
    await this.signInPromise

    const settingsFile = await this.getSettingsFile()
    if (settingsFile) {
      await this.updateJsonFile(settingsFile.id, settings)
      console.log(`Updated settings file ${settingsFile.id}: ${JSON.stringify(settings)}`)
      return;
    }

    const settingsId = await this.createJsonFile("appDataFolder", "settings.json", settings)
    console.log(`Created new settings: ${settingsId} ${JSON.stringify(settings)}`)
  }

  async loadSettings(): Promise<Object | undefined> {
    await this.signInPromise;
    const settingsFile = await this.getSettingsFile();
    if (!settingsFile) {
      console.log("No settings file found")
      return undefined
    }

    var settings = await this.http.get(settingsFile.downloadUrl, { headers: this.getAuthHeaders() }).toPromise()

    console.log(`Loaded settings ${JSON.stringify(settings)}`)

    return settings;
  }

  async updateJsonFile(fileId: string, content: any) {
    await this.signInPromise

    const url = this.getUploadUrl(`/${fileId}`)

    var metadataReponse = await this.http.put(url, null, { observe: "response", headers: this.getAuthHeaders() }).toPromise()

    return await this.uploadData(metadataReponse, content)
  }

  async createJsonFile(parent: string, fileName: string, content: any): Promise<string> {
    await this.signInPromise

    const baseRoot = gapi['config'].get('googleapis.config').root;

    const metadata = {
      "title": fileName,
      "parents": [{ id: parent }]
    };


    const url = this.getUploadUrl()

    var metadataResponse = await this.http.post(url, metadata, { observe: "response", headers: this.getAuthHeaders() }).toPromise()
    return await this.uploadData(metadataResponse, content)
  }

  private async uploadData(metadataResponse: HttpResponse<Object>, content: any): Promise<string> {
    if (!metadataResponse.ok) {
      throw new Error(`Error during POST: ${JSON.stringify(metadataResponse.body)}`)
    }
    var location = metadataResponse.headers.get("Location")

    if (location == null) {
      throw new Error("No location header in POST response")
    }

    const response = await this.http.put(location, content, { headers: new HttpHeaders({ "Content-Type": "application/json", }) }).toPromise()
    const file = response as gapi.client.drive.FileResource

    console.log(`Uploaded data ${file.id}`)
    return file.id
  }

  async loadFileInfo(fileId: string): Promise<FileInfo> {
    await this.signInPromise

    return await gapi.client.drive.files.get({ fileId: fileId }).then(success => {
      console.log(`Loaded file info`)
      return { fileName: success.result.title, role: success.result.userPermission.role, exists: true }
    }, error => {
      console.log(`Load error ${JSON.stringify(error)}`)
      if (error.status == 404 || error.status == 403) {
        return { exists: false }
      }

      throw new Error(`Failed loading of file ${JSON.stringify(error)}`)
    })
  }
}
