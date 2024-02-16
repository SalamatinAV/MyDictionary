import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DictionaryComponent } from './components/dictionary/dictionary.component';
import { StudyingComponent } from './components/studying/studying.component';
import { FavoritesComponent } from './components/favorites/favorites.component';

const routes: Routes = [
  { path: '', redirectTo: 'studying', pathMatch: 'full' },
  { path: 'studying', component: StudyingComponent },
  { path: 'dictionary', component: DictionaryComponent },
  { path: 'favorites', component: FavoritesComponent },
 
  { path: '**', component: StudyingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
