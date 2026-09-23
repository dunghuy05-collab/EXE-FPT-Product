import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pacecar-user") || "null");
    } catch {
      localStorage.removeItem("pacecar-user");
      return null;
    }
  });
  const value = useMemo(
    () => ({
      user,
      login(nextUser) {
        const { token, ...safeUser } = nextUser;
        setUser(safeUser);
        localStorage.setItem("pacecar-user", JSON.stringify(safeUser));
        if (token) localStorage.setItem("pacecar-token", token);
      },
      logout() {
        const token = localStorage.getItem("pacecar-token");
        if (token)
          fetch("/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            keepalive: true,
          }).catch(() => {});
        localStorage.removeItem("pacecar-user");
        localStorage.removeItem("pacecar-token");
        setUser(null);
      },
    }),
    [user],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
