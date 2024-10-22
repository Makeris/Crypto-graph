import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SocketResponse } from '../interfaces';
import { PriceType, Subscription } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: WebSocket;
  public messages = new Subject<SocketResponse>();

  connect(url: string, sessionId: string, provider: string): void {
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      this.messages.next(JSON.parse(event.data));
    };

    this.socket.onopen = () => {
      this.sendMessage(sessionId, provider);
    };
  }

  closeConnection(): void {
    this.socket && this.socket.close();
  }

  sendMessage(instrumentId: string, provider: string): void {
    const message = {
      type: Subscription.SUBSRIPTION_TYPE,
      id: '1',
      instrumentId: instrumentId,
      provider,
      subscribe: true,
      kinds: [PriceType.Ask, PriceType.Bid, PriceType.Last],
    };

    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error(
        'WebSocket is not open. Ready state: ',
        this.socket.readyState,
      );
    }
  }
}
