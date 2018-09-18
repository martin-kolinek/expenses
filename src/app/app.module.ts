import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PapaParseModule } from 'ngx-papaparse';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ColorPickerModule } from 'ngx-color-picker';

import { AppRoutingModule } from './/app-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { CreateComponent } from './create/create.component';
import { ProgressComponent } from './progress/progress.component'
import { ImportComponent } from './import/import.component';
import { RecordsComponent } from './records/records.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ShellComponent } from './shell/shell.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CategoriesComponent } from './categories/categories.component';

import { GlobalErrorHandler } from './error.service';
import { ErrorComponent } from './error/error.component'

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    CreateComponent,
    ProgressComponent,
    ImportComponent,
    RecordsComponent,
    ShellComponent,
    CategoriesComponent,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatChipsModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    PapaParseModule,
    ColorPickerModule
  ],
  providers: [{
    provide: ErrorHandler,
    useClass: GlobalErrorHandler
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
