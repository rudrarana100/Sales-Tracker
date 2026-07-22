import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

const MOCK_USER = {
  id: "user_demo_123",
  email: "rudra@builtstack.com",
  user_metadata: {
    full_name: "Rudra Rana",
    avatar_url: "",
    role: "admin",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : MOCK_USER;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            setUser(data.session.user);
          }
        }
      } catch (err) {
        console.warn("Supabase auth session check fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          setUser(data.user);
          localStorage.setItem("auth_user", JSON.stringify(data.user));
          setLoading(false);
          return { success: true };
        }
      }
    } catch (err) {
      console.warn("Supabase auth login fallback:", err);
    }
    // Fallback demo user login
    const newUser = {
      id: "user_" + Date.now(),
      email,
      user_metadata: {
        full_name: email.split("@")[0].replace(/\./g, " ").toUpperCase(),
        role: "admin",
      },
    };
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setLoading(false);
    return { success: true };
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role: "admin" } },
        });
        if (!error && data?.user) {
          setUser(data.user);
          localStorage.setItem("auth_user", JSON.stringify(data.user));
          setLoading(false);
          return { success: true };
        }
      }
    } catch (err) {
      console.warn("Supabase auth register fallback:", err);
    }
    const newUser = {
      id: "user_" + Date.now(),
      email,
      user_metadata: { full_name: fullName, role: "admin" },
    };
    setUser(newUser);
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    setLoading(false);
    return { success: true };
  };

  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn("Supabase signout fallback:", err);
    }
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const updateProfile = (updates) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        user_metadata: {
          ...prev?.user_metadata,
          ...updates,
        },
      };
      localStorage.setItem("auth_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
