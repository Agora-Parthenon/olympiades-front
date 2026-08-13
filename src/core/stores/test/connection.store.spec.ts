import { useConnectionStore } from '../connection.store';

describe('useConnectionStore', () => {
  beforeEach(() => {
    useConnectionStore.setState({ isConnected: false, isLost: false });
  });

  it('démarre déconnecté et sans perte de connexion signalée', () => {
    expect(useConnectionStore.getState()).toMatchObject({ isConnected: false, isLost: false });
  });

  it('markConnected() passe isConnected à true et efface un isLost précédent', () => {
    useConnectionStore.setState({ isLost: true });

    useConnectionStore.getState().markConnected();

    expect(useConnectionStore.getState()).toMatchObject({ isConnected: true, isLost: false });
  });

  it('markDisconnected() passe isConnected à false sans modifier isLost', () => {
    useConnectionStore.setState({ isConnected: true, isLost: true });

    useConnectionStore.getState().markDisconnected();

    // isLost n'est affecté que par markLost/markConnected : markDisconnected sert aux
    // tentatives de reconnexion silencieuses (CA-02), qui ne doivent pas déclencher la bannière.
    expect(useConnectionStore.getState()).toMatchObject({ isConnected: false, isLost: true });
  });

  it('markLost() passe isConnected à false et isLost à true', () => {
    useConnectionStore.setState({ isConnected: true, isLost: false });

    useConnectionStore.getState().markLost();

    expect(useConnectionStore.getState()).toMatchObject({ isConnected: false, isLost: true });
  });
});
