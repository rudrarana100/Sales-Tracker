import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial active session on load
    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Auth session init error:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // 2. Listen to real-time auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Real Supabase Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      return data;
    } catch (err) {
      console.error("Login failed:", err.message);
      throw err; // Re-throw to allow LoginPage toast to display exact error
    } finally {
      setLoading(false);
    }
  };

  // Real Supabase Registration
  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: "admin",
          },
        },
      });

      if (error) throw error;

      setUser(data.user);
      return data;
    } catch (err) {
      console.error("Registration failed:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real Supabase Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      setUser(null);
    }
  };

  // Sync profile metadata changes back to Supabase auth
  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      setUser(data.user);
      return data;
    } catch (err) {
      console.error("Update profile error:", err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}