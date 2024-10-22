import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AuthService } from '../services';
import { LoaderService } from '../services/loader.service';

export function headerInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);
  const token = authService.getCurrentToken();
  const tokenType = authService.getTokenType();

  if (request.headers.has('Skip-Interceptor')) return next(request);
  loaderService.show();

  const modifiedRequest = request.clone({
    headers: request.headers.append('Authorization', `${tokenType} ${token}`),
  });

  return next(modifiedRequest).pipe(
    finalize(() => {
      loaderService.hide();
    }),
  );
}
