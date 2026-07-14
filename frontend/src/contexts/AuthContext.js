import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("bk_admin_token"));
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await adminApi.me();
        setAdmin(me);
      } catch (e) {
        localStorage.removeItem("bk_admin_token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await adminApi.login(email, password);
    localStorage.setItem("bk_admin_token", data.token);
    setToken(data.token);
    setAdmin({ email: data.email, role: data.role });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("bk_admin_token");
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
