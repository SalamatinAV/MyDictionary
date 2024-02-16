import { Injectable } from '@angular/core';
import { DictionaryModel } from '../models/dictionary.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private dictionary$ = new BehaviorSubject<DictionaryModel[]>(
    this.getLocalStoroge()
  );

  private dictionaryOfSelectedWords$ = new BehaviorSubject<DictionaryModel[]>(
    this.getLocalStorogeSelectedWords()
  );

  constructor() {}

  private updateData(newData: DictionaryModel[]): void {
    this.dictionary$.next(newData);
    this.setLocalStoroge(newData);
  }

  private updateDataSelectedWords(newData: DictionaryModel[]): void {
    this.dictionaryOfSelectedWords$.next(newData);
    this.setLocalStorogeSelectedWords(newData);
  }

  getData(): Observable<DictionaryModel[]> {
    return this.dictionary$.asObservable();
  }

  getDataSelectedWords(): Observable<DictionaryModel[]> {
    return this.dictionaryOfSelectedWords$.asObservable();
  }

  //  Добавление в словарь
  addWords(item: DictionaryModel) {
    const currentData = this.dictionary$.value;
    const newData = [...currentData, { ...item }];
    this.updateData(newData);
  }

  // Удаление слова
  deleteWord(idx: string) {
    const currentData = this.dictionary$.value;
    const newData = currentData.filter((item) => item.wordEn !== idx);
    this.updateData(newData);
  }

  // Удалить словарь
  deleteDictionary() {
    this.updateData([]);
    this.updateDataSelectedWords([]);
  }

  // Добавление и удаление слов в избранные
  favorites(ed: DictionaryModel): void {
    const currentData = this.dictionary$.value;
    currentData.forEach((e) => {
      if (e.wordEn === ed.wordEn) {
        e.favorites = !e.favorites;
      }
      console.log(e.favorites);
    });
    const favoritesArray = currentData.filter((e) => e.favorites);
    this.updateDataSelectedWords(favoritesArray);
    // console.log(favoritesArray);
    this.updateData(currentData);
  }

  // Редактирование в словаре
  editWordInDictionary(currentData: DictionaryModel[]) {
    this.updateData(currentData);
  }

  // Сохранение данных в localStorage
  private setLocalStoroge(data: DictionaryModel[]): void {
    localStorage.setItem('translations', JSON.stringify(data));
  }

  private setLocalStorogeSelectedWords(data: DictionaryModel[]) {
    localStorage.setItem('favorites', JSON.stringify(data));
  }

  // Загрузка данных из localStorage
  private getLocalStoroge(): DictionaryModel[] {
    const storedTranslations = localStorage.getItem('translations');
    return storedTranslations ? JSON.parse(storedTranslations) : [];
  }

  private getLocalStorogeSelectedWords() {
    const storedTranslations = localStorage.getItem('favorites');
    return storedTranslations ? JSON.parse(storedTranslations) : [];
  }
}
