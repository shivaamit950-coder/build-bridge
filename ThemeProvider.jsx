"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("buildbridge-theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.body.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    setDark((prev) => {
      const next = !prev;
      document.body.classList.toggle("dark", next);
      localStorage.setItem("buildbridge-theme", next ? "dark" : "light");
      return next;
    });
  }

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
