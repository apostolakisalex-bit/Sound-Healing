import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { api, setAuthToken, getAuthToken } from "@/src/api/client";

const processedSessions = new Set<string>();
function extractSessionId(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/[?#&]session_id=([^&#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export type User = {
  id: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  profile_image?: string;
  title: string;
  level: string;
  xp: number;
  stamps: string[];
  unlocked_realms: string[];
  role: string;
  email_verified?: boolean;
  application_complete?: boolean;
  membership_status?: string;
  created_at?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithSession: (sessionId: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    name: string,
    location?: string,
    application?: Record<string, unknown>,
  ) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setUser(null);
        return;
      }
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
      await setAuthToken(null);
    }
  }, []);

  const loginWithSession = useCallback(async (sessionId: string) => {
    if (processedSessions.has(sessionId)) {
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data as User;
    }
    processedSessions.add(sessionId);
    const { data } = await api.post("/auth/session", { session_id: sessionId });
    await setAuthToken(data.token);
    setUser(data.user);
    return data.user as User;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === "web") {
          const sid =
            extractSessionId(window.location.hash) ||
            extractSessionId(window.location.search);
          if (sid) {
            await loginWithSession(sid);
            try {
              window.history.replaceState(
                window.history.state,
                "",
                window.location.pathname || "/",
              );
            } catch {
              /* ignore */
            }
            setLoading(false);
            return;
          }
        } else {
          const sid = extractSessionId(await Linking.getInitialURL());
          if (sid) {
            await loginWithSession(sid);
            setLoading(false);
            return;
          }
        }
      } catch {
        /* fall back to normal session check */
      }
      await refresh();
      setLoading(false);
    })();
  }, [refresh, loginWithSession]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Linking.addEventListener("url", ({ url }) => {
      const sid = extractSessionId(url);
      if (sid) void loginWithSession(sid);
    });
    return () => sub.remove();
  }, [loginWithSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    await setAuthToken(data.token);
    setUser(data.user);
    return data.user as User;
  }, []);

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      location?: string,
      application?: Record<string, unknown>,
    ) => {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        name,
        location,
        application,
      });
      await setAuthToken(data.token);
      setUser(data.user);
      return data.user as User;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* Clear local credentials even when offline. */
    }
    await setAuthToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    const { data } = await api.put("/auth/me", patch);
    setUser(data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithSession,
        register,
        logout,
        refresh,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
