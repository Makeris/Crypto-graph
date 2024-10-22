import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  CandleResponse,
  ExchangesResponse,
  ProviderResponse,
  ResponseData,
} from '../interfaces';
import { Observable } from 'rxjs';
import { generateGetRequestUrl } from '../utility';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  httpClient = inject(HttpClient);

  getInstrumentsList(request = {}): Observable<ResponseData> {
    const url = generateGetRequestUrl(
      environment.platformUrl,
      '/api/instruments/v1/instruments',
      request,
    );

    return this.httpClient.get<ResponseData>(url);
  }

  getProvidersList(): Observable<ProviderResponse> {
    const endpoint = '/api/instruments/v1/providers';
    const url = generateGetRequestUrl(environment.platformUrl, endpoint);

    return this.httpClient.get<ProviderResponse>(url);
  }

  getExchangesList(): Observable<ExchangesResponse> {
    const endpoint = '/api/instruments/v1/exchanges';
    const url = generateGetRequestUrl(environment.platformUrl, endpoint);

    return this.httpClient.get<ExchangesResponse>(url);
  }

  getBarsCountBack(request = {}): Observable<CandleResponse> {
    const endpoint = '/api/bars/v1/bars/count-back';
    const url = generateGetRequestUrl(
      environment.platformUrl,
      endpoint,
      request,
    );

    return this.httpClient.get<CandleResponse>(url);
  }

  getBarsDateRange(request = {}): Observable<CandleResponse> {
    const endpoint = '/api/bars/v1/bars/date-range';
    const url = generateGetRequestUrl(
      environment.platformUrl,
      endpoint,
      request,
    );

    return this.httpClient.get<CandleResponse>(url);
  }

  getBarsTimeBack(request = {}): Observable<ExchangesResponse> {
    const endpoint = '/api/data-consolidators/bars/v1/bars/time-back';
    const url = generateGetRequestUrl(environment.platformUrl, endpoint);

    return this.httpClient.get<ExchangesResponse>(url);
  }
}
