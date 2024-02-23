import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';

import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';

import { AppComponent } from './app.component';
import { StudyingComponent } from './components/studying/studying.component';
import { DictionaryComponent } from './components/dictionary/dictionary.component';
import { InformationsComponent } from './components/informations/informations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommaSpacePipe } from './pipes/comma-space.pipe';
import { DeleteDictionariDialogComponent } from './components/delete-dictionari-dialog/delete-dictionari-dialog.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { FavoritesComponent } from './components/favorites/favorites.component';

@NgModule({
  declarations: [
    AppComponent,
    StudyingComponent,
    DictionaryComponent,
    InformationsComponent,
    DeleteDictionariDialogComponent,
    ErrorDialogComponent,
    CommaSpacePipe,
    FavoritesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    BrowserAnimationsModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatCheckboxModule,
    MatInputModule,
    MatDialogModule,
    MatBadgeModule,
    PaginatorModule,
    TooltipModule,
    MatSelectModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
