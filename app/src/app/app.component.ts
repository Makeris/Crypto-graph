import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AuthService,
  CandleData,
  ChartService,
  DataItem,
  HttpErrorResponse,
  SocketResponse,
  ToasterService,
  Units,
  WebSocketService,
} from './shared';
import {
  BehaviorSubject,
  Observable,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import {
  ChartLineComponent,
  LoaderComponent,
  SearchComponent,
  ToasterComponent,
} from './components';
import { AsyncPipe, CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';

@Component({
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    SearchComponent,
    AsyncPipe,
    CommonModule,
    ChartLineComponent,
    LoaderComponent,
    ToasterComponent,
  ],
  selector: 'app-root',
  standalone: true,
  styleUrl: './app.component.css',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  chartService = inject(ChartService);

  toasterService = inject(ToasterService);

  webSocketService = inject(WebSocketService);

  authService = inject(AuthService);

  destroy$ = new Subject<void>();

  providersList$ = new BehaviorSubject<string[]>([]);

  chartData$ = new BehaviorSubject<CandleData[]>([]);

  newChart$ = new Subject<CandleData[]>();

  symbol = '';

  timestamp = '';

  price = '';

  ngOnInit() {
    this.authService
      .getTokenId()
      .pipe(
        take(1),
        switchMap(() => this.getProvidersList()),
      )
      .subscribe({
        next: () => {
          this.authService.startTokenValidation();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        },
      });
  }

  getProvidersList(): Observable<string[]> {
    return this.chartService.getProvidersList().pipe(
      take(1),
      map((providers) => [''].concat(providers.data)),
      tap((data: string[]) => this.providersList$.next(data)),
    );
  }

  getInfoFromWebSocket(sessionId: string, provider: string): void {
    const wsUrl = environment.webSocketUrl + this.authService.getCurrentToken();
    this.webSocketService.connect(wsUrl, sessionId, provider);
  }

  onSubscribeClick(data: { item: DataItem; provider: string }): void {
    const { item: dataItem, provider } = data;
    if (dataItem) {
      const sessionId = dataItem?.id;
      this.webSocketService.closeConnection();
      this.getCandleResponse({
        sessionId,
        provider,
        dataItem,
      });
    }
  }

  getWebSocketMessages(): void {
    this.webSocketService.messages.pipe(takeUntil(this.destroy$)).subscribe({
      next: (message) => {
        const innerInfo = message.ask || message.bid || message.last;
        if (message && innerInfo) {
          console.log(message);
          this.addData(message);
          this.price = message?.last?.price ?? this.price;
          this.timestamp = innerInfo.timestamp ?? this.timestamp;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      },
    });
  }

  getCandleResponse(request: {
    sessionId: string;
    provider: string;
    dataItem: DataItem;
  }): void {
    const { sessionId, provider, dataItem } = request;
    this.chartService
      .getBarsCountBack({
        instrumentId: sessionId,
        provider,
        barsCount: 10,
        interval: 1,
        periodicity: Units.MINUTE,
      })
      .pipe(
        take(1),
        map((res) => res.data),
      )
      .subscribe({
        next: (candleData) => {
          this.symbol = dataItem?.symbol;

          this.chartData$.next(candleData);
          this.getInfoFromWebSocket(sessionId, provider);
          this.getWebSocketMessages();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        },
      });
  }

  addData(value: SocketResponse): void {
    this.newChart$.next([this.convertToCandle(value)]);
  }

  handleError({ error }: HttpErrorResponse): void {
    const errorData = error?.error?.data;

    this.toasterService?.addMessage(
      errorData ? errorData[Object.keys(errorData)[0]] : error?.error?.message,
    );
  }

  convertToCandle(data: SocketResponse): CandleData {
    return {
      t: data?.last?.timestamp || '',
      o: data?.bid?.price || 0,
      h: Math.max(
        data?.bid?.price || 0,
        data?.ask?.price || 0,
        data?.last?.price || 0,
      ),
      l: Math.min(
        data?.bid?.price || 0,
        data?.ask?.price || 0,
        data?.last?.price || 0,
      ),
      c: data?.last?.price || 0,
      v: data?.last?.volume || 0,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
