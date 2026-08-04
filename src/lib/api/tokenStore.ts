type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

/**
 * Access tokens live in memory only — never in localStorage/sessionStorage.
 * This limits exposure if an XSS bug ever slips into the app: a token that
 * only exists in a JS variable disappears on tab close/reload, at which
 * point the app silently re-authenticates using the httpOnly refresh
 * cookie (see AuthContext's bootstrap effect).
 */
export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null) {
    accessToken = token;
    listeners.forEach((l) => l(token));
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
