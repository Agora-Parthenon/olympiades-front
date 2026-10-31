import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getGatewayUrl } from './config.service';
import { ensureFreshToken, getToken } from './token-provider.service';

export const httpClient = axios.create({
  baseURL: getGatewayUrl(),
});

/**
 * Ajoute le token à chaque requête, en le renouvelant d'abord s'il est sur le point d'expirer
 * (US-09, CA-01) : l'utilisateur n'a rien à faire. Si la session ne peut plus être renouvelée,
 * la requête n'est pas envoyée (la session est alors marquée comme expirée, CA-02).
 * Un visiteur (sans token) passe tel quel.
 */
export async function attachAuthHeader(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  if (getToken()) {
    await ensureFreshToken();
  }

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

httpClient.interceptors.request.use(attachAuthHeader);
