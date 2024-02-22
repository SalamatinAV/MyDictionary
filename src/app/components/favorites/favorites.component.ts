import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DictionaryModel } from 'src/app/models/dictionary.model';
import { DictionaryService } from 'src/app/services/dictionary.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  first: number = 0;
  rows: number = 100;
  totalRecords: number = 0;
  page: number = 0;
  flagReverseDictionary: boolean = false;

  firstSelected: number = 0;
  firstError: number = 0;

  languagePriority: string = 'Избранные';
  language: string[] = ['Избранные', 'Работа над ошибками'];

  formControlSearch: FormControl = new FormControl('');

  dictionarySelectedWords: DictionaryModel[] = [];
  dictionaryErrorWord: DictionaryModel[] = [];
  intermediateArray: DictionaryModel[] = [];

  searchDictionary: DictionaryModel[] = [];

  constructor(private dictionaryService: DictionaryService) {}

  useDictionary(word: string) {
    if (word === 'Избранные') {
      this.searchDictionary = [...this.dictionarySelectedWords];
      this.first = this.firstSelected;
    } else if (word === 'Работа над ошибками') {
      this.searchDictionary = [...this.dictionaryErrorWord];
      this.first = this.firstError;
    }
    this.intermediateArray = this.searchDictionary;
  }

  ngOnInit(): void {
    // this.first = this.dictionaryService.getCurrentPageFavorites();

    this.dictionaryService.getDatawordsErrorLog().subscribe((data) => {
      this.dictionaryErrorWord = data;
    });

    this.dictionaryService.getDataSelectedWords().subscribe((word) => {
      this.dictionarySelectedWords = word;
      this.intermediateArray = this.dictionarySelectedWords;
      this.totalRecords = this.dictionarySelectedWords.length;
      this.searchInArray(this.formControlSearch.value.toLowerCase().trim());
    });

    this.formControlSearch.valueChanges.subscribe((e) => {
      this.searchInArray(e.toLowerCase().trim());
      this.totalRecords = this.searchDictionary.length;
    });
  }

  deleteFavorites(word: DictionaryModel, ev: Event) {
    ev.stopPropagation();
    if (this.languagePriority === 'Избранные') {
      this.dictionaryService.favorites(word);
    }
  }

  reversDictionary() {
    this.flagReverseDictionary = !this.flagReverseDictionary;
    this.searchDictionary.reverse();
  }

  searchInArray(searchText: string) {
    if (searchText === '') {
      this.searchDictionary = [...this.intermediateArray];
      if (this.flagReverseDictionary) {
        this.searchDictionary.reverse();
      }
      return;
    }

    this.searchDictionary = this.intermediateArray.filter(
      (item) =>
        item.wordRu.toLowerCase().includes(searchText) ||
        item.wordEn.toLowerCase().includes(searchText)
    );
    if (this.flagReverseDictionary) {
      this.searchDictionary.reverse();
    }
  }

  onPageChange(event: any) {
    if (this.languagePriority === 'Избранные') {
      this.firstSelected = event.first;
      this.first = this.firstSelected;
    } else if (this.languagePriority === 'Работа над ошибками') {
      this.firstError = event.first;
      this.first = this.firstError;
    }
    console.log(this.firstSelected);
  }

  getBadgeValue(languagePriority: string): number | undefined {
    if (
      languagePriority === 'Избранные' &&
      this.dictionarySelectedWords.length > 0
    ) {
      return this.dictionarySelectedWords.length;
    } else if (
      languagePriority === 'Работа над ошибками' &&
      this.dictionaryErrorWord.length > 0
    ) {
      return this.dictionaryErrorWord.length;
    } else {
      return undefined; // или любое другое значение по умолчанию
    }
  }
}
