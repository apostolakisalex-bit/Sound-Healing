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

const inflightSessions = new Map<string, Promise<User>>();
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
  loginWithApple: (
    identityToken: string,
    name?: string | null,
    email?: string | null,
  ) => Promise<User>;
  welcomeName: string | null;
  dismissWelcome: () => void;
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
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const dismissWelcome = useCallback(() => setWelcomeName(null), []);

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
    // Exchange each session_id exactly once and share that single in-flight
    // promise with every caller — the auth-session result, the hot deep-link
    // listener and the cold-start handler can all surface the same id. Without
    // this, a second caller would race ahead to /auth/me before the token is
    // stored and fail with a 401.
    const existing = inflightSessions.get(sessionId);
    if (existing) return existing;
    const run = (async () => {
      const { data } = await api.post("/auth/session", {
        session_id: sessionId,
      });
      await setAuthToken(data.token);
      setUser(data.user);
      // Greet the user right after a Google sign-in (this path is Google-only).
      setWelcomeName((data.user?.name || "").trim().split(/\s+/)[0] || null);
      return data.user as User;
    })();
    inflightSessions.set(sessionId, run);
    try {
      return await run;
    } catch (e) {
      inflightSessions.delete(sessionId);
      throw e;
    }
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

  const loginWithApple = useCallback(
    async (
      identityToken: string,
      name?: string | null,
      email?: string | null,
    ) => {
      const { data } = await api.post("/auth/apple", {
        identity_token: identityToken,
        name: name || null,
        email: email || null,
      });
      await setAuthToken(data.token);
      setUser(data.user);
      // Greet the user right after an Apple sign-in, same as the Google path.
      setWelcomeName((data.user?.name || "").trim().split(/\s+/)[0] || null);
      return data.user as User;
    },
    [],
  );

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
        loginWithApple,
        welcomeName,
        dismissWelcome,
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
