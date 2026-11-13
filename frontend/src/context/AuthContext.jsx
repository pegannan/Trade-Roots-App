import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  // Restore the session when the app opens.
  useEffect(() => {
    if (!getToken()) return;
    api('/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = useCallback(async (path, body) => {
    const { token, user: loggedIn } = await api(path, { method: 'POST', body });
    setToken(token);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      register: (body) => authenticate('/auth/register', body),
      login: (body) => authenticate('/auth/login', body),
      logout: () => {
        setToken(null);
        setUser(null);
      },
      setPurpose: async (purpose) =>
        setUser(await api('/me/purpose', { method: 'PATCH', body: { purpose } })),
      switchMode: async (mode) =>
        setUser(await api('/me/mode', { method: 'PATCH', body: { mode } })),
    }),
    [user, loading, authenticate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
