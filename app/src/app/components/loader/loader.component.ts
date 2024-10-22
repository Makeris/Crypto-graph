import { Component, inject } from '@angular/core';
import { LoaderService } from '../../shared/services/loader.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    @if (isLoading$ | async) {
      <div class="loader d-flex justify-content-center align-items-center">
        Loading...
      </div>
    }
  `,
  imports: [AsyncPipe],
  styles: [
    `
      .loader {
        position: fixed;
        background: lightgrey;
        opacity: 0.4;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
      }
    `,
  ],
})
export class LoaderComponent {
  loaderService = inject(LoaderService);

  isLoading$ = this.loaderService.loading$;
}
