import { Component, OnInit } from '@angular/core';
import { DictionaryService } from './services/dictionary.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'dictionary';
  wordCount: number = 0;
  constructor(private dictionaryService: DictionaryService) {}

  ngOnInit(): void {
    this.dictionaryService
      .getData()
      .subscribe((dictionari) => (this.wordCount = dictionari.length));
  }
}
