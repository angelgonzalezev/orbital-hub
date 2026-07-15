export type WalletDeepLink = {
  name: string;
  buildUrl: (dappUrl: string, ref: string) => string;
};

const enc = encodeURIComponent;

export const walletDeepLinks: WalletDeepLink[] = [
  { name: 'Phantom', buildUrl: (url, ref) => `https://phantom.app/ul/browse/${enc(url)}?ref=${enc(ref)}` },
  { name: 'Solflare', buildUrl: (url, ref) => `https://solflare.com/ul/v1/browse/${enc(url)}?ref=${enc(ref)}` },
  { name: 'Backpack', buildUrl: (url, ref) => `https://backpack.app/ul/v1/browse/${enc(url)}?ref=${enc(ref)}` },
  // MetaMask expects host+path without scheme; Solana support on mobile is mainnet-only.
  { name: 'MetaMask', buildUrl: (url) => `https://link.metamask.io/dapp/${url.replace(/^https?:\/\//, '')}` },
];

export const isMobileUserAgent = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  // iPadOS reports itself as MacIntel; touch points tell it apart.
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent) || iPadOs;
};

export const getCurrentDappUrl = () =>
  `${window.location.origin}${window.location.pathname}${window.location.search}`;
