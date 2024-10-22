import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ToasterService } from '../../shared';
import { delay, filter, Subject, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-toaster',
  standalone: true,
  template: `
    @if (isDisplayMessage$ | async) {
      <div class="toaster-container">
        <div class="toaster-message">
          {{ toasterMessage$ | async }}
        </div>
      </div>
    }
  `,
  imports: [AsyncPipe],
  styles: [
    `
      .toaster-container {
        position: fixed;
        left: 10%;
        bottom: 5%;
        max-width: 18.75rem;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
      }

      .toaster-message {
        background-color: #f44336;
        color: white;
        padding: 0.5rem 1rem;
        font-weight: bold;
        border-radius: 1rem;
        box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.2);
        transition: opacity 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .toaster-message button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1rem;
      }

      .toaster-message button:hover {
        opacity: 0.7;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToasterComponent implements OnInit, OnDestroy {
  toasterService = inject(ToasterService);

  toasterMessage$ = this.toasterService.toasterMessage;

  isDisplayMessage$ = this.toasterService.isDisplayMessage;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.subscribeToMessages();
  }

  subscribeToMessages(): void {
    this.toasterMessage$
      .pipe(takeUntil(this.destroy$), filter(Boolean), delay(3000))
      .subscribe(() => {
        this.removeMessage();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeMessage(): void {
    this.toasterService.isDisplayMessage$.next(false);
  }
}
