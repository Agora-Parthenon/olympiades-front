import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('monte la coquille applicative sur la page d’accueil', () => {
    render(<App />);

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
