type TokenProvider = () => string | undefined;

let tokenProvider: TokenProvider = () => undefined;

export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

export function getToken(): string | undefined {
  return tokenProvider();
}