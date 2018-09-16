import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component'
import { CreateComponent } from './create/create.component';
import { ImportComponent } from './import/import.component';
import { RecordsComponent } from './records/records.component';

const routes: Routes = [
  { path: "settings", component: SettingsComponent },
  { path: "create/:id", component: CreateComponent },
  { path: "import", component: ImportComponent },
  { path: "records", component: RecordsComponent },
  { path: '', redirectTo: '/records', pathMatch: 'full' },
]

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, { useHash: true })]
})

export class AppRoutingModule { }
