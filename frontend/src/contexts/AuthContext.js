import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // `session` holds the authenticated admin's public profile (email/role) only.
  // The actual JWT never touches JS-accessible storage — it lives in an
  // httpOnly cookie set by the backend, sent automatically via withCredentials.
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const me = await adminApi.me();
        if (mounted) setSession(me);
      } catch (e) {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    checkSession();
    return () => {
      mounted = false;
    };
  }, []);

  // Global safety net: any 401 from an /admin endpoint (expired token, cleared
  // cookie, or a logout race) immediately clears the local session so
  // ProtectedRoute redirects instead of showing a stale authenticated UI.
  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener("bk:auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("bk:auth:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await adminApi.login(email, password);
    setSession({ email: data.email, role: data.role });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch (e) {
      // Even if the network call fails, clear local session state so the
      // user is treated as logged out client-side.
    } finally {
      setSession(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token: session, admin: session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
