import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DictionaryService } from 'src/app/services/dictionary.service';
import { DeleteDictionariDialogComponent } from '../delete-dictionari-dialog/delete-dictionari-dialog.component';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DictionaryModel } from 'src/app/models/dictionary.model';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.scss'],
})
export class DictionaryComponent implements OnInit {
  first: number = 0;
  rows: number = 25;
  totalRecords: number = 0;
  page: number = 0;

  dictionary: DictionaryModel[] = [];
  searchDictionary: DictionaryModel[] = [];
  dialogErrorWord: string[] = [];

  formControlSearch: FormControl = new FormControl('');
  formControlTextarea: FormControl = new FormControl('', [
    Validators.required,
    this.latinCyrillicValidator(),
  ]);

  selectedWord?: DictionaryModel;
  flagReverseDictionary: boolean = false;

  constructor(
    public dictionaryService: DictionaryService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dictionaryService.getData().subscribe((data) => {
      this.dictionary = data;
      this.totalRecords = this.dictionary.length;
      this.searchInArray(this.formControlSearch.value.toLowerCase().trim());
    });

    this.formControlSearch.valueChanges.subscribe((e) => {
      this.searchInArray(e.toLowerCase().trim());
      this.totalRecords = this.searchDictionary.length;
    });

    this.formControlTextarea.valueChanges.subscribe((value) => {
      if (!value) {
        this.formControlTextarea.reset('', { emitEvent: false });
        return;
      }
      if (!this.formControlTextarea.touched) {
        this.formControlTextarea.markAsTouched();
      }
    });
  }

  // =========================================Поиск в словаре
  searchInArray(searchText: string) {
    if (searchText === '') {
      this.searchDictionary = [...this.dictionary];
      if (this.flagReverseDictionary) {
        this.searchDictionary.reverse();
      }
      return;
    }
    this.searchDictionary = this.dictionary.filter(
      (item) =>
        item.wordRu.toLowerCase().includes(searchText) ||
        item.wordEn.toLowerCase().includes(searchText)
    );
    if (this.flagReverseDictionary) {
      this.searchDictionary.reverse();
    }
  }

  // reverse dictionary list
  reversDictionary() {
    this.flagReverseDictionary = !this.flagReverseDictionary;
    this.searchDictionary.reverse();
  }

  // ================================================ Диалоговые окна

  openErrorDialog(errorMessage: string): void {
    this.dialog
      .open(ErrorDialogComponent, {
        data: { errorMessage },
      })
      .afterClosed()
      .subscribe((q) => console.log(q));
  }

  deleteDictionaryDialog(key: string, word?: DictionaryModel): void {
    this.dialog
      .open(DeleteDictionariDialogComponent, {
        data: { key, word },
      })
      .afterClosed()
      .subscribe((boolean) => {
        if (!boolean) {
          this.selectedWord = undefined;
        }
      });
  }

  addWords() {
    const str = this.formControlTextarea.value.split('\n');
    str.forEach((str: string) => {
      if (str !== '') {
        const subStr = str.split('=');

        if (subStr.length === 2) {
          const subObject: DictionaryModel = {
            wordEn: subStr[0].trim(),
            wordRu: subStr[1].trim(),
            data: new Date(),
            favorites: false,
          };

          if (!this.dictionary.some((t) => t.wordEn === subObject.wordEn)) {
            this.dictionaryService.addWords(subObject);
          } else {
            this.dialogErrorWord.push(
              `"${subObject.wordEn.toLocaleUpperCase()}"`
            );
          }
        }
      }
    });
    if (this.dialogErrorWord.length > 0) {
      this.openErrorDialog(
        `Перевод со словом  ${this.dialogErrorWord.join(' ')} уже существует .`
      );
      this.dialogErrorWord = [];
    }
    this.formControlTextarea.setValue('');
    this.formControlSearch.setValue('');
  }

  // =============================================

  selectWord(word: DictionaryModel) {
    if (this.selectedWord === word) {
      this.selectedWord = undefined;
    } else this.selectedWord = word;
  }

  favorites(word: DictionaryModel, ev: Event) {
    ev.stopPropagation();
    this.dictionaryService.favorites(word);
  }

  editWord() {
    this.deleteDictionaryDialog('edit', this.selectedWord);
  }

  cancelWordFlag() {
    this.selectedWord = undefined;
  }

  deleteWord() {
    this.deleteDictionaryDialog('deleteWord', this.selectedWord);
  }

  private latinCyrillicValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value;

      if (!value) {
        return null;
      }

      const lines: string[] = value.split('\n');

      for (const line of lines) {
        if (line.trim() === '') {
          continue;
        }
        const parts: string[] = line.split('=').map((item) => item.trim());

        if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
          return { latinCyrillic: true };
        }

        const latinPart: string = parts[0];
        const cyrillicPart: string = parts[1];

        const latinRegex: RegExp = /^[a-zA-Z-',.\s]+$/;
        const cyrillicRegex: RegExp = /^[а-яА-Я-,\s]+$/;

        if (!latinRegex.test(latinPart) || !cyrillicRegex.test(cyrillicPart)) {
          return { latinCyrillic: true };
        }
      }
      return null;
    };
  }

  isShowRequiredError(): void {
    if (!this.formControlTextarea.value) {
      this.formControlTextarea.markAsUntouched();
    }
  }

  onPageChange(event: any) {
    this.first = event.first;
  }
}
