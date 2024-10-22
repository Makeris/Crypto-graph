export interface AuthResponse {
  access_token: string;
  expires_in: number;
  not_before_policy: number;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  session_state: string;
  token_type: string;
}

export interface Paging {
  page: number;
  pages: number;
  items: number;
}

export interface Mappings {
  cryptoquote?: {
    symbol: string;
    exchange: string;
  };
  simulation?: {
    symbol: string;
    exchange: string;
    defaultOrderSize: number;
  };
  alpaca?: {
    symbol: string;
    exchange: string;
    defaultOrderSize: number;
  };
  dxfeed?: {
    symbol: string;
    exchange: string;
    defaultOrderSize: number;
  };
}

export interface GICS {
  sectorId: number;
  industryGroupId: number;
  industryId: number;
  subIndustryId: number;
}

export interface Profile {
  name: string;
  location?: string;
  gics: GICS | {};
}

export interface DataItem {
  id: string;
  symbol: string;
  kind: string;
  exchange: string;
  description: string;
  tickSize: number;
  currency: string;
  baseCurrency?: string;
  mappings: Mappings;
  profile: Profile;
}

export interface ResponseData {
  paging: Paging;
  data: DataItem[];
}

export interface Ask {
  timestamp: string;
  price: number & string;
  volume: number & string;
  change?: number;
  changePct?: number;
}

export interface SocketResponse {
  type: string;
  instrumentId: string;
  provider: string;
  ask?: Ask;
  bid?: Ask;
  last?: Ask;
}

export interface ProviderResponse {
  data: string[];
}

export interface ExchangeData {
  oanda: string[];
  dxfeed: string[];
  simulation: string[];
  alpaca: string[];
  cryptoquote: string[];
  'active-tick': string[];
}

export interface ExchangesResponse {
  data: ExchangeData;
}

export interface CandleData {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface CandleResponse {
  data: CandleData[];
}

export interface SearchResults {
  name: string;
  tags: Tags;
}

export type Tags = string[];

export interface ChartConfig {
  animationEnabled: boolean;
  theme: string;
  title: {
    text: string;
  };
  axisY2: {
    labelFormatter: string;
  };
  toolTip: {
    shared: boolean;
  };
  data: Array<{
    type: string;
    dataPoints: Array<DisplayFormat>;
    showInLegend?: boolean;
    name?: string;
    axisYType?: string;
    yValueFormatString?: string;
  }>;
  subtitles?: Array<{
    text: string;
  }>;
}

export type DisplayFormat = { label: string; y: number[] | number };

export interface ToastMessage {
  text: string;
}

export interface HttpErrorResponse {
  headers: {
    normalizedNames: Record<string, boolean>;
    lazyUpdate: boolean | null;
  };
  status: number;
  statusText: string;
  url: string;
  ok: boolean;
  name: string;
  message: string;
  error: {
    error: {
      code: string;
      message: string;
      data: {
        [key: string]: string;
      };
    };
  };
}
