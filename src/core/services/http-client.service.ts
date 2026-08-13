import axios, { type InternalAxiosRequestConfig } from 'axios';
import { getGatewayUrl } from './config.service';
import { getToken } from './token-provider.service';

export const httpClient = axios.create({
  baseURL: getGatewayUrl(),
});

export function attachAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

httpClient.interceptors.request.use(attachAuthHeader);
