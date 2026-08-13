import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import { getGatewayUrl } from './config.service';
import { getToken } from './token-provider.service';
import { useConnectionStore } from '../stores/connection.store';

// DAT §5.3 : 3 tentatives, délai croissant.
const RECONNECT_DELAYS = [1000, 2000, 4000];

/**
 * La gateway valide l'authentification au moment de l'upgrade HTTP (avant toute
 * négociation STOMP), en lisant ?token=... sur l'URL — voir server.on('upgrade')
 * côté gateway. Les headers STOMP (connectHeaders) arrivent APRÈS l'upgrade et ne
 * sont donc jamais lus par ce mécanisme : le token doit être dans l'URL.
 *
 * `service` route la connexion vers le bon backend jeu côté gateway (sinon
 * 'platform' par défaut) — utile une fois dans une partie précise (ex: 'uno').
 * Optionnel : à confirmer avec toi si la feature lobby en a besoin dès le join,
 * ou seulement une fois la partie identifiée.
 */
function buildBrokerUrl(service?: string): string {
  const params = new URLSearchParams({ token: getToken() ?? '' });
  if (service) {
    params.set('service', service);
  }
  return `${getGatewayUrl().replace(/^http/, 'ws')}/ws?${params.toString()}`;
}

/**
 * Connexion temps réel à la demande (rejoint le lobby → connect(), quitte → disconnect()) —
 * pas de connexion globale au bootstrap de l'app, contrairement à Keycloak/Axios.
 */
export class WebsocketService {
  private client?: Client;
  private reconnectAttempts = 0;
  private manuallyDisconnected = false;
  private service?: string;

  constructor(private readonly onConnectionLost?: () => void) {}

  connect(service?: string): void {
    this.manuallyDisconnected = false;
    this.service = service;

    this.client = new Client({
      // webSocketFactory (pas brokerURL) : rappelée à CHAQUE tentative de connexion,
      // donc le token est toujours relu à jour — y compris sur les reconnexions,
      // après un éventuel refresh Keycloak entre-temps.
      webSocketFactory: () => new WebSocket(buildBrokerUrl(this.service)),
      reconnectDelay: 0, // on pilote nous-mêmes le nombre de tentatives et le délai
      debug: () => {},
      onConnect: () => {
        this.reconnectAttempts = 0;
        useConnectionStore.getState().markRestored();
      },
      onStompError: (frame) => {
        console.error('Erreur STOMP', frame);
      },
      onWebSocketClose: () => {
        if (!this.manuallyDisconnected) {
          this.tryReconnect();
        }
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.manuallyDisconnected = true;
    this.client?.deactivate();
  }

  private tryReconnect(): void {
    if (!this.client) {
      return;
    }

    if (this.reconnectAttempts >= RECONNECT_DELAYS.length) {
      this.onConnectionLost?.();
      return;
    }

    const delay = RECONNECT_DELAYS[this.reconnectAttempts];
    this.reconnectAttempts += 1;

    setTimeout(() => {
      if (!this.manuallyDisconnected) {
        this.client?.activate();
      }
    }, delay);
  }

  subscribe(
    destination: string,
    callback: (message: IMessage) => void,
  ): StompSubscription | undefined {
    return this.client?.subscribe(destination, callback);
  }

  publish(destination: string, body: unknown): void {
    this.client?.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  connected(): boolean {
    return this.client?.connected ?? false;
  }
}

export const websocketService = new WebsocketService(() => {
  useConnectionStore.getState().markLost();
});