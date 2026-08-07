import { Client } from "@stomp/stompjs";
import type { IMessage, StompSubscription } from "@stomp/stompjs";import { getGatewayUrl } from "./config.service";
import { getToken } from "./token-provider.service";

const RECONNECT_DELAYS = [1000, 2000, 4000];

export class WebsocketService {
  private client?: Client;

  private reconnectAttempts = 0;

  private manuallyDisconnected = false;

  constructor(
    private readonly onConnectionLost?: (message: string) => void
  ) {}

  connect() {
    this.manuallyDisconnected = false;

    this.client = new Client({
      brokerURL: `${getGatewayUrl().replace(/^http/, "ws")}/ws`,

      connectHeaders: {
        Authorization: `Bearer ${getToken()}`,
      },

      reconnectDelay: 0,

      debug: () => {},

      onConnect: () => {
        console.log("WebSocket connecté");
        this.reconnectAttempts = 0;
      },

      onStompError: (frame) => {
        console.error("Erreur STOMP", frame);
      },

      onWebSocketClose: () => {
        if (!this.manuallyDisconnected) {
          this.tryReconnect();
        }
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.manuallyDisconnected = true;
    this.client?.deactivate();
  }

  private tryReconnect() {
    if (!this.client) {
      return;
    }

    if (this.reconnectAttempts >= RECONNECT_DELAYS.length) {
      this.onConnectionLost?.(
        "Connexion au serveur perdue. Vérifiez votre réseau puis rechargez la page."
      );
      return;
    }

    const delay = RECONNECT_DELAYS[this.reconnectAttempts];

    this.reconnectAttempts++;

    console.warn(
      `Reconnexion WebSocket (${this.reconnectAttempts}/${RECONNECT_DELAYS.length}) dans ${delay} ms`
    );

    setTimeout(() => {
      if (!this.manuallyDisconnected) {
        this.client?.activate();
      }
    }, delay);
  }

  subscribe(
    destination: string,
    callback: (message: IMessage) => void
  ): StompSubscription | undefined {
    return this.client?.subscribe(destination, callback);
  }

  publish(destination: string, body: unknown) {
    this.client?.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  connected() {
    return this.client?.connected ?? false;
  }
}

export const websocketService = new WebsocketService((message) => {
  alert(message);
});