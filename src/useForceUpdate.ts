import { useReducer } from 'react';

export function useForceUpdate() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  return forceUpdate;
}
