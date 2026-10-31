import { render, screen } from '@testing-library/react';
import { useUserStore } from '@/core/stores/user.store';
import ProfilePage from '../profile.page';

describe('ProfilePage', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
  });

  it('affiche le pseudo de l’utilisateur connecté', () => {
    useUserStore.setState({ user: { id: 'u-1', pseudo: 'Lucy', roles: ['ROLE_USER'] } });

    render(<ProfilePage />);

    expect(screen.getByRole('heading', { name: 'Mon profil' })).toBeInTheDocument();
    expect(screen.getByText(/Lucy/)).toBeInTheDocument();
  });
});
