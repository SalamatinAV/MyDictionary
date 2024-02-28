import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { DictionaryModel } from 'src/app/models/dictionary.model';
import { DictionaryService } from 'src/app/services/dictionary.service';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

@Component({
  selector: 'app-delete-dictionari-dialog',
  templateUrl: './delete-dictionari-dialog.component.html',
  styleUrls: ['./delete-dictionari-dialog.component.scss'],
})
export class DeleteDictionariDialogComponent {
  editFormGroup: FormGroup = this.fb.group({
    editEn: [
      this.data.word?.wordEn,
      [Validators.required, this.latinValidator()],
    ],
    editRu: [
      this.data.word?.wordRu,
      [Validators.required, this.cirilicValidator()],
    ],
  });

  currentData: DictionaryModel[] = [];

  constructor(
    public matDialog: MatDialog,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DeleteDictionariDialogComponent>,
    public dictionaryService: DictionaryService,
    @Inject(MAT_DIALOG_DATA) public data: { key: string; word: DictionaryModel }
  ) {}

  deleteDictionary() {
    this.dictionaryService.deleteDictionary();
  }

  deleteWord() {
    this.dictionaryService.deleteWord(this.data.word.wordEn);
    this.dialogRef.close(false);
  }

  saveEditedWord() {
    this.dictionaryService
      .getData()
      .subscribe((data) => (this.currentData = data));

    const withoutOldWord = this.currentData.filter(
      (v) => v.wordEn !== this.data.word.wordEn
    );

    const indexElement = this.currentData.findIndex(
      (idx) =>
        idx.wordEn === this.data.word.wordEn &&
        idx.wordRu === this.data.word.wordRu
    );

    if (
      indexElement !== -1 &&
      !withoutOldWord.some(
        (s) =>
          s.wordEn.trim() === this.editFormGroup.get('editEn')?.value.trim()
      )
    ) {
      this.currentData[indexElement].wordEn =
        this.editFormGroup.get('editEn')?.value;
      this.currentData[indexElement].wordRu =
        this.editFormGroup.get('editRu')?.value;
    } else {
      this.openErrorDialog(
        'exists',
        `Перевод со словом "${
          this.editFormGroup.get('editEn')?.value
        }" уже существует .`
      );
    }

    this.dictionaryService.editWordInDictionary(this.currentData);
  }

  close() {
    this.dialogRef.close(true);
  }

  openErrorDialog(key: string, errorMessage: string): void {
    this.matDialog.open(ErrorDialogComponent, {
      data: { key, errorMessage },
    });
  }

  private latinValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const latinPattern = /^[a-zA-Z-',./?!\s]+$/;
      const isValid = latinPattern.test(control.value);
      return isValid ? null : { latinOnly: { value: control.value } };
    };
  }
  private cirilicValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const latinPattern = /^[а-яА-Я-',./?!\s]+$/;
      const isValid = latinPattern.test(control.value);
      return isValid ? null : { latinOnly: { value: control.value } };
    };
  }
}
