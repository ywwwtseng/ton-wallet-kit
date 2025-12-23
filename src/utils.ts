import TonWeb from 'tonweb';

export const parseJSON = (src: unknown) => {
  try {
    if (typeof src !== 'string') {
      return src;
    }

    return JSON.parse(src) as unknown;
  } catch {
    return null;
  }
}

export function toFriendlyAddress(address?: string): string | undefined {
  if (!address) {
    return undefined;
  }

  const tonweb = new TonWeb();

  return new tonweb.Address(address).toString(true, true, true, false);
}
