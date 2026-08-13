import { setTokenProvider } from '../token-provider.service';
import { useConnectionStore } from '../../stores/connection.store';

// On mocke @stomp/stompjs entièrement : on ne veut pas ouvrir de vraie WebSocket en test,
// juste vérifier que websocket.service.ts pilote correctement le cycle de vie du Client
// (nombre de tentatives, délais, callbacks). vi.hoisted() est nécessaire car vi.mock()
// est hoisté au-dessus des imports par Vitest.
interface FakeStompClientConfig {
  webSocketFactory: () => unknown;
  onConnect?: () => void;
  onWebSocketClose?: () => void;
  onStompError?: (frame: unknown) => void;
}

const { activateMock, deactivateMock, subscribeMock, publishMock, configRef } = vi.hoisted(() => ({
  activateMock: vi.fn(),
  deactivateMock: vi.fn(),
  subscribeMock: vi.fn(),
  publishMock: vi.fn(),
  configRef: { current: undefined as FakeStompClientConfig | undefined },
}));

vi.mock('@stomp/stompjs', () => ({
  // Fonction classique (pas une arrow function) : c'est requis pour qu'un mock
  // Vitest reste utilisable avec `new` — les arrow functions ne sont pas des
  // constructeurs valides en JS et lèveraient "is not a constructor".
  Client: vi.fn().mockImplementation(function (config: FakeStompClientConfig) {
    configRef.current = config;
    return {
      activate: activateMock,
      deactivate: deactivateMock,
      subscribe: subscribeMock,
      publish: publishMock,
      connected: false,
    };
  }),
}));

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  constructor(public readonly url: string) {
    MockWebSocket.instances.push(this);
  }
}

// Import après la déclaration du mock (peu importe l'ordre réel grâce au hoisting de vi.mock,
// mais on le place ici pour la lisibilité).
import { WebsocketService, websocketService } from '../websocket.service';

describe('WebsocketService', () => {
  let onConnectionLost: ReturnType<typeof vi.fn<() => void>>;
  let service: WebsocketService;

  beforeEach(() => {
    vi.useFakeTimers();
    activateMock.mockClear();
    deactivateMock.mockClear();
    subscribeMock.mockClear();
    publishMock.mockClear();
    configRef.current = undefined;
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket);
    setTokenProvider(() => 'test-token');
    useConnectionStore.setState({ isConnected: false, isLost: false });
    onConnectionLost = vi.fn<() => void>();
    service = new WebsocketService(onConnectionLost);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setTokenProvider(() => undefined);
  });

  describe('connexion', () => {
    it('active le client STOMP dès connect()', () => {
      service.connect();

      expect(activateMock).toHaveBeenCalledTimes(1);
    });

    it('construit l’URL du broker avec le token en query param (CA-01 côté WS)', () => {
      service.connect();
      configRef.current?.webSocketFactory();

      expect(MockWebSocket.instances).toHaveLength(1);
      expect(MockWebSocket.instances[0].url).toBe('ws://localhost:8080/ws?token=test-token');
    });

    it('ajoute le paramètre "service" quand il est fourni à connect()', () => {
      service.connect('uno');
      configRef.current?.webSocketFactory();

      expect(MockWebSocket.instances[0].url).toBe(
        'ws://localhost:8080/ws?token=test-token&service=uno',
      );
    });

    it('relit le token à chaque tentative (webSocketFactory rappelée, pas un token figé)', () => {
      service.connect();
      configRef.current?.webSocketFactory();

      setTokenProvider(() => 'nouveau-token-apres-refresh');
      configRef.current?.webSocketFactory();

      expect(MockWebSocket.instances[1].url).toContain('token=nouveau-token-apres-refresh');
    });

    it('marque la connexion comme établie sur onConnect', () => {
      service.connect();

      configRef.current?.onConnect?.();

      expect(useConnectionStore.getState()).toMatchObject({ isConnected: true, isLost: false });
    });
  });

  describe('reconnexion automatique (CA-02)', () => {
    it('tente 3 reconnexions avec un délai croissant (1s, 2s, 4s) après une coupure', () => {
      service.connect();
      expect(activateMock).toHaveBeenCalledTimes(1);

      configRef.current?.onWebSocketClose?.();
      expect(useConnectionStore.getState().isConnected).toBe(false);
      vi.advanceTimersByTime(999);
      expect(activateMock).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(1);
      expect(activateMock).toHaveBeenCalledTimes(2);

      configRef.current?.onWebSocketClose?.();
      vi.advanceTimersByTime(1999);
      expect(activateMock).toHaveBeenCalledTimes(2);
      vi.advanceTimersByTime(1);
      expect(activateMock).toHaveBeenCalledTimes(3);

      configRef.current?.onWebSocketClose?.();
      vi.advanceTimersByTime(3999);
      expect(activateMock).toHaveBeenCalledTimes(3);
      vi.advanceTimersByTime(1);
      expect(activateMock).toHaveBeenCalledTimes(4);

      expect(onConnectionLost).not.toHaveBeenCalled();
    });

    it('déclenche le callback de perte de connexion après le 3e échec, pas avant', () => {
      service.connect();

      configRef.current?.onWebSocketClose?.();
      vi.advanceTimersByTime(1000);
      configRef.current?.onWebSocketClose?.();
      vi.advanceTimersByTime(2000);
      configRef.current?.onWebSocketClose?.();
      expect(onConnectionLost).not.toHaveBeenCalled();

      vi.advanceTimersByTime(4000);
      configRef.current?.onWebSocketClose?.();

      expect(onConnectionLost).toHaveBeenCalledTimes(1);
      expect(activateMock).toHaveBeenCalledTimes(4);
    });

    it('réinitialise le compteur de tentatives après une reconnexion réussie', () => {
      service.connect();
      configRef.current?.onWebSocketClose?.();
      vi.advanceTimersByTime(1000);
      configRef.current?.onConnect?.();

      configRef.current?.onWebSocketClose?.();
      vi.advanceTimersByTime(999);
      expect(activateMock).toHaveBeenCalledTimes(2);
      vi.advanceTimersByTime(1);
      expect(activateMock).toHaveBeenCalledTimes(3);
    });

    it('n’essaie pas de se reconnecter après un disconnect() manuel', () => {
      service.connect();
      service.disconnect();

      expect(deactivateMock).toHaveBeenCalledTimes(1);
      expect(useConnectionStore.getState().isConnected).toBe(false);

      activateMock.mockClear();
      configRef.current?.onWebSocketClose?.();
      vi.advanceTimersByTime(10_000);

      expect(activateMock).not.toHaveBeenCalled();
      expect(onConnectionLost).not.toHaveBeenCalled();
    });

    it('n’interrompt pas le service en cas d’erreur STOMP (juste loggée)', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      service.connect();

      expect(() =>
        configRef.current?.onStompError?.({ headers: { message: 'boom' } }),
      ).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('subscribe / publish', () => {
    it('subscribe() délègue au client STOMP sous-jacent', () => {
      service.connect();
      const callback = vi.fn();

      service.subscribe('/topic/lobby', callback);

      expect(subscribeMock).toHaveBeenCalledWith('/topic/lobby', callback);
    });

    it('publish() sérialise le corps en JSON et délègue au client STOMP', () => {
      service.connect();

      service.publish('/app/lobby/join', { pseudo: 'jdupont' });

      expect(publishMock).toHaveBeenCalledWith({
        destination: '/app/lobby/join',
        body: JSON.stringify({ pseudo: 'jdupont' }),
      });
    });

    it('subscribe()/publish() sans connexion active ne lèvent pas d’erreur', () => {
      expect(() => service.subscribe('/topic/x', vi.fn())).not.toThrow();
      expect(() => service.publish('/app/x', {})).not.toThrow();
    });
  });

  describe('connected()', () => {
    it('renvoie false avant toute connexion', () => {
      expect(service.connected()).toBe(false);
    });
  });
});

describe('websocketService (singleton exporté)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    activateMock.mockClear();
    configRef.current = undefined;
    setTokenProvider(() => 'token');
    useConnectionStore.setState({ isConnected: false, isLost: false });
  });

  afterEach(() => {
    vi.useRealTimers();
    setTokenProvider(() => undefined);
  });

  it('est bien câblé sur useConnectionStore.markLost() après 3 échecs de reconnexion', () => {
    websocketService.connect();
    configRef.current?.onWebSocketClose?.();
    vi.advanceTimersByTime(1000);
    configRef.current?.onWebSocketClose?.();
    vi.advanceTimersByTime(2000);
    configRef.current?.onWebSocketClose?.();
    vi.advanceTimersByTime(4000);
    configRef.current?.onWebSocketClose?.();

    expect(useConnectionStore.getState().isLost).toBe(true);

    websocketService.disconnect();
  });
});
