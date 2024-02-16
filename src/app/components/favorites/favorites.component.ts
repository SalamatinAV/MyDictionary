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
  rows: number = 25;
  totalRecords: number = 0;
  page: number = 0;
  flagReverseDictionary: boolean = false;

  formControlSearch: FormControl = new FormControl('');

  dictionarySelectedWords: DictionaryModel[] = [];
  searchDictionary: DictionaryModel[] = [];

  constructor(private dictionaryService: DictionaryService) {}

  ngOnInit(): void {
    this.dictionaryService.getDataSelectedWords().subscribe((word) => {
      this.dictionarySelectedWords = word;
      this.totalRecords = this.dictionarySelectedWords.length;
      this.searchInArray(this.formControlSearch.value.toLowerCase().trim());
    });
    this.formControlSearch.valueChanges.subscribe((e) => {
      this.searchInArray(e.toLowerCase().trim());
    });
  }

  deleteFavorites(word: DictionaryModel, ev: Event) {
    ev.stopPropagation();
    this.dictionaryService.favorites(word);
  }

  reversDictionary() {
    this.flagReverseDictionary = !this.flagReverseDictionary;
    this.searchDictionary.reverse();
  }

  searchInArray(searchText: string) {
    if (searchText === '') {
      this.searchDictionary = [...this.dictionarySelectedWords];
      if (this.flagReverseDictionary) {
        this.searchDictionary.reverse();
      }
      return;
    }
    this.searchDictionary = this.dictionarySelectedWords.filter(
      (item) =>
        item.wordRu.toLowerCase().includes(searchText) ||
        item.wordEn.toLowerCase().includes(searchText)
    );
    if (this.flagReverseDictionary) {
      this.searchDictionary.reverse();
    }
  }

  onPageChange(event: any) {
    this.first = event.first;
  }
}
