import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  messageSubject$ = new BehaviorSubject<string>('');
  toasterMessage = this.messageSubject$.asObservable();

  isDisplayMessage$ = new BehaviorSubject<boolean>(false);
  isDisplayMessage = this.isDisplayMessage$.asObservable();

  addMessage(text = 'Something went wrong... Please try again later.'): void {
    this.messageSubject$.next(text);
    this.isDisplayMessage$.next(true);
  }
}
