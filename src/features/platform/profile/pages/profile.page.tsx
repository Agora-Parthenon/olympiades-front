import { useState } from 'react';
import type { FC } from 'react';
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useAvatars, useMyProfile, useUpdateProfile } from '../hooks/use-profile.hook';
import { PSEUDO_PATTERN, profileErrorCode, type Profile } from '../services/profile.service';

/** Un pictogramme par avatar prédéfini (la liste elle-même vient de back-platform). */
const AVATAR_EMOJIS: Record<string, string> = {
  fox: '🦊',
  owl: '🦉',
  cat: '🐱',
  bear: '🐻',
  wolf: '🐺',
  panda: '🐼',
  frog: '🐸',
  lion: '🦁',
};

const PSEUDO_RULE = 'Le pseudo doit contenir de 3 à 20 lettres, chiffres ou tirets.';

function errorMessage(error: unknown): string {
  switch (profileErrorCode(error)) {
    case 'pseudo_taken':
      return 'Ce pseudo est déjà utilisé';
    case 'invalid_pseudo':
      return PSEUDO_RULE;
    default:
      return 'Impossible d’enregistrer le profil, réessayez dans un instant.';
  }
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(iso));

const ProfileForm: FC<{ profile: Profile }> = ({ profile }) => {
  const { data: avatars = [] } = useAvatars();
  const { mutate, isPending, isSuccess, error, reset } = useUpdateProfile();
  const [pseudo, setPseudo] = useState(profile.pseudo);
  const [avatar, setAvatar] = useState<string | null>(profile.avatar);

  const trimmed = pseudo.trim();
  const pseudoValid = PSEUDO_PATTERN.test(trimmed);
  const unchanged = trimmed === profile.pseudo && avatar === profile.avatar;

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    mutate({ pseudo: trimmed, avatar });
  };

  return (
    <Stack component="form" onSubmit={save} spacing={2} noValidate sx={{ maxWidth: '28rem' }}>
      <TextField
        label="Pseudo"
        value={pseudo}
        onChange={(e) => {
          setPseudo(e.target.value);
          reset();
        }}
        error={!pseudoValid}
        helperText={pseudoValid ? ' ' : PSEUDO_RULE}
        slotProps={{ htmlInput: { maxLength: 20 } }}
        required
      />

      <Stack spacing={1}>
        <Typography id="avatar-label" variant="subtitle2">
          Avatar
        </Typography>
        <ToggleButtonGroup
          exclusive
          aria-labelledby="avatar-label"
          value={avatar}
          onChange={(_, value: string | null) => {
            setAvatar(value);
            reset();
          }}
          sx={{ flexWrap: 'wrap' }}
        >
          {avatars.map((id) => (
            <ToggleButton key={id} value={id} aria-label={id}>
              {AVATAR_EMOJIS[id] ?? id}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {error && <Alert severity="error">{errorMessage(error)}</Alert>}
      {isSuccess && <Alert severity="success">Profil mis à jour</Alert>}

      <Button type="submit" variant="contained" disabled={!pseudoValid || unchanged || isPending}>
        Enregistrer
      </Button>
    </Stack>
  );
};

/** Page réservée aux joueurs connectés : leur profil, et la possibilité de le modifier (US-015). */
const ProfilePage: FC = () => {
  const { data: profile, isPending, isError } = useMyProfile();

  return (
    <Stack component="main" data-testid="profile-page" spacing={3} sx={{ p: 4 }}>
      <Typography variant="h1">Mon profil</Typography>

      {isPending && <CircularProgress aria-label="Chargement du profil" />}
      {isError && <Alert severity="error">Impossible de charger votre profil.</Alert>}

      {profile && (
        <>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, fontSize: '2rem' }}>
              {profile.avatar
                ? (AVATAR_EMOJIS[profile.avatar] ?? profile.avatar)
                : profile.pseudo[0]}
            </Avatar>
            <Stack>
              <Typography variant="h2" data-testid="profile-pseudo">
                {profile.pseudo}
              </Typography>
              <Typography color="text.secondary" data-testid="profile-created-at">
                Inscrit le {formatDate(profile.createdAt)}
              </Typography>
            </Stack>
          </Stack>

          <ProfileForm key={profile.id} profile={profile} />
        </>
      )}
    </Stack>
  );
};

export default ProfilePage;
