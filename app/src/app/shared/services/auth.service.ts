import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, tap, timer } from 'rxjs';
import { AuthResponse } from '../interfaces';
import { environment } from '../../../../environments/environment';
import { TokenTypes } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private token = '';
  private refreshToken = '';
  private tokenType: TokenTypes = TokenTypes.BEARER;
  private tokenExpiration: number = 0;
  private checkInterval = 10 * 60 * 1000;

  startTokenValidation(): void {
    timer(0, this.checkInterval)
      .pipe(switchMap(() => this.checkTokenValidity()))
      .subscribe();
  }

  private checkTokenValidity(): Observable<AuthResponse | null> {
    const now = Date.now();
    if (this.tokenExpiration && this.tokenExpiration > now) {
      return of(null);
    }

    return this.refreshTokenId().pipe(
      catchError(() => {
        return of(null);
      }),
    );
  }

  getCurrentToken(): string | null {
    return this.token || localStorage.getItem('access_token');
  }

  getTokenType(): string {
    return this.tokenType;
  }

  getTokenId(): Observable<AuthResponse> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', 'app-cli');
    body.set('username', 'r_test@fintatech.com');
    body.set('password', 'kisfiz-vUnvy9-sopnyv');

    return this.httpClient
      .post<AuthResponse>(
        `${environment.platformUrl}/identity/realms/${environment.realm}/protocol/openid-connect/token`,
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Skip-Interceptor': 'true',
          },
        },
      )
      .pipe(tap(this.patchTokenInfo.bind(this)));
  }

  private patchTokenInfo(response: AuthResponse): void {
    this.token = response.access_token;
    this.refreshToken = response.refresh_token;
    this.tokenType = response.token_type as TokenTypes;
    this.tokenExpiration = Date.now() + response.expires_in * 1000;
    localStorage.setItem('access_token', this.token);
    localStorage.setItem('refresh_token', this.refreshToken);
  }

  refreshTokenId(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.httpClient
      .post<AuthResponse>(`${environment.platformUrl}/refresh`, {
        refresh_token: refreshToken,
      })
      .pipe(tap(this.patchTokenInfo.bind(this)));
  }
}
