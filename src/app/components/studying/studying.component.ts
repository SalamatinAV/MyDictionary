import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DictionaryModel } from 'src/app/models/dictionary.model';
import { DictionaryService } from 'src/app/services/dictionary.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  selector: 'app-studying',
  templateUrl: './studying.component.html',
  styleUrls: ['./studying.component.scss'],
})
export class StudyingComponent implements OnInit {
  @ViewChild('myInput') inputElement!: ElementRef;

  selectOptions = [5, 10, 20, 30, 40, 50, 75, 100];

  inputControl: FormControl = new FormControl('');
  selectControl: FormControl = new FormControl(5);

  dictionary: DictionaryModel[] = [];
  favoritDictionary: DictionaryModel[] = [];
  wordErrorDictionary: DictionaryModel[] = [];

  selectedDictionary: DictionaryModel[] = [];

  mistakesArray: DictionaryModel[] = [];

  flagShowTranslation: boolean = false;
  grade: boolean | null = null;
  noWord: boolean = false;
  shiftKeyEnabled: boolean = false;

  currentIndex: number = 0;

  languagePriority: string = 'Русский - Английский';
  language: string[] = ['Русский - Английский', 'Английский - Русский'];

  wordOrder = this._formBuilder.group({
    random: false,
    repeat: false,
  });

  wordPriority: string = 'Весь словарь';
  priority: string[] = [
    'Весь словарь',
    'Избранные слова',
    'Работа над ошибками',
    'Выбрать последние',
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private dictionaryService: DictionaryService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dictionaryService
      .getDatawordsErrorLog()
      .subscribe((data) => (this.wordErrorDictionary = [...data]));

    this.selectControl.valueChanges.subscribe(() => {
      this.currentIndex = 0;

      if (this.wordPriority === 'Выбрать последние') {
        let selectedValue = +this.selectControl.value;
        this.selectedDictionary = [...this.dictionary.slice(0, selectedValue)];
      }
      this.randomArray();
    });

    this.dictionaryService.getData().subscribe((data) => {
      this.dictionary = data;
      this.selectedDictionary = [...this.dictionary];
      if (this.dictionary.length > 5) {
        this.selectOptions = this.selectOptions.filter(
          (option) => option <= this.dictionary.length
        );
      }
    });

    this.dictionaryService.getDataSelectedWords().subscribe((data) => {
      this.favoritDictionary = data;
    });

    this.inputControl.valueChanges.subscribe((word) => {
      if (word === '') this.grade = null;
    });

    // ==========================
    this.wordOrder.get('random')?.valueChanges.subscribe(() => {
      this.currentIndex = 0;
      this.noWord = false;
      this.flagShowTranslation = false;
      this.inputControl.setValue('');

      if (this.wordPriority === 'Весь словарь') {
        this.selectedDictionary = [...this.dictionary];
      } else if (this.wordPriority === 'Избранные слова') {
        this.selectedDictionary = [...this.favoritDictionary];
      } else if (this.wordPriority === 'Работа над ошибками') {
        this.selectedDictionary = [...this.wordErrorDictionary];
      } else if (this.wordPriority === 'Выбрать последние') {
        let selectedValue = +this.selectControl.value;
        this.selectedDictionary = [...this.dictionary.slice(0, selectedValue)];
      }

      this.randomArray();
    });

    this.wordOrder.get('repeat')?.valueChanges.subscribe(() => {
      this.noWord = false;
    });
  }

  ngAfterViewInit(): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.focus();
      this.cdr.detectChanges();
    }
  }

  openErrorDialog(key: string, errorMessage?: string): void {
    this.dialog.open(ErrorDialogComponent, {
      data: { key, errorMessage },
    });
  }

  isAnyArrayEmpty(season: string) {
    return (
      (season === 'Избранные слова' && this.favoritDictionary.length === 0) ||
      (season === 'Весь словарь' && this.dictionary.length === 0) ||
      (season === 'Работа над ошибками' &&
        this.wordErrorDictionary.length === 0) ||
      (season === 'Выбрать последние' && this.dictionary.length < 5)
    );
  }

  handleRadioClick(event: Event, season: string): void {
    if (this.isAnyArrayEmpty(season)) {
      event.stopPropagation();
      event.preventDefault();
    } else {
      this.useDictionary(season);
    }
  }

  backWord() {
    this.shiftKeyEnabled = false;

    if (this.wordOrder.get('repeat')?.value) {
      if (this.currentIndex <= 0 && !this.wordOrder.get('random')?.value) {
        this.currentIndex = this.selectedDictionary.length - 1;
      } else if (!this.wordOrder.get('random')?.value) {
        this.currentIndex -= 1;
      }
    } else {
      if (this.currentIndex > 0) {
        if (this.noWord) {
          this.currentIndex = this.selectedDictionary.length - 1;
          this.noWord = false;
        } else this.currentIndex -= 1;
      }
    }

    this.flagShowTranslation = false;
    this.grade = null;
    this.inputControl.setValue('');
  }

  nextWord() {
    this.shiftKeyEnabled = false;

    if (
      this.wordOrder.get('repeat')?.value &&
      this.wordOrder.get('random')?.value
    ) {
      this.currentIndex = Math.floor(
        Math.random() * this.selectedDictionary.length
      );
    }

    if (this.wordOrder.get('repeat')?.value) {
      if (this.currentIndex >= this.selectedDictionary.length - 1) {
        this.currentIndex = -1;
      }

      this.currentIndex += 1;
    } else {
      if (this.currentIndex < this.selectedDictionary.length - 1) {
        this.noWord = false;
        this.currentIndex += 1;
      } else {
        this.noWord = true;
      }
    }

    this.flagShowTranslation = false;
    this.grade = null;
    this.inputControl.setValue('');
    console.log(this.noWord);
  }

  examinationWord() {
    if (!this.noWord) {
      this.shiftKeyEnabled = true;
      const inputValue = this.inputControl.value.trim().toUpperCase();
      const currentWord = this.selectedDictionary[this.currentIndex];

      if (!inputValue) {
        this.grade = null;
        return;
      }

      if (this.languagePriority === 'Русский - Английский') {
        this.grade = inputValue === currentWord.wordEn.toUpperCase();
      } else if (this.languagePriority === 'Английский - Русский') {
        const wordRu = currentWord.wordRu
          .split(',')
          .map((word) => word.trim().toUpperCase());
        this.grade = wordRu.includes(inputValue);
      }

      this.errorChecking();
    }
  }

  showTranslite() {
    if (this.shiftKeyEnabled) {
      this.flagShowTranslation = !this.flagShowTranslation;
    }
  }

  redirectToDictionary() {
    this.router.navigate(['/dictionary']);
  }

  private useDictionary(word: string) {
    this.currentIndex = 0;
    this.noWord = false;
    this.flagShowTranslation = false;
    this.inputControl.setValue('');
    this.selectControl.setValue(5);

    if (word === 'Весь словарь') {
      this.selectedDictionary = [...this.dictionary];
    } else if (word === 'Избранные слова') {
      this.selectedDictionary = [...this.favoritDictionary];
    } else if (word === 'Работа над ошибками') {
      this.wordOrder.controls['repeat'].setValue(false);
      this.selectedDictionary = [...this.wordErrorDictionary];
    } else if (word === 'Выбрать последние') {
      let selectedValue = +this.selectControl.value;
      this.selectedDictionary = [...this.dictionary.slice(0, selectedValue)];
    }

    this.randomArray();
  }

  private errorChecking(): void {
    if (
      !this.grade &&
      !this.mistakesArray.some(
        (word) =>
          word.wordEn === this.selectedDictionary[this.currentIndex].wordEn
      )
    ) {
      this.mistakesArray.push(this.selectedDictionary[this.currentIndex]);
      this.dictionaryService.addErrorWord(
        this.selectedDictionary[this.currentIndex]
      );
    } else if (this.grade) {
      this.mistakesArray = this.mistakesArray.filter(
        (word) =>
          word.wordEn !== this.selectedDictionary[this.currentIndex].wordEn
      );

      this.dictionaryService.filtrErrorWord(
        this.selectedDictionary[this.currentIndex]
      );
    }
    if (
      this.wordPriority === 'Работа над ошибками' &&
      this.wordErrorDictionary.length === 0
    ) {
      setTimeout(() => {
        this.openErrorDialog('non');
        this.wordPriority = 'Весь словарь';
        this.selectedDictionary = [...this.dictionary];
        this.currentIndex = 0;
        this.flagShowTranslation = false;
        this.grade = null;
        this.noWord = false;
        this.inputControl.setValue('');
      }, 1500);
    }
  }

  private randomArray(): void {
    if (this.wordOrder.get('random')?.value) {
      const randomArray = this.selectedDictionary.sort(
        () => Math.random() - 0.5
      );
      this.selectedDictionary = [...randomArray];
    }
  }
}
