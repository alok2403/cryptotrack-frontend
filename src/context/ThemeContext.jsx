import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);


// =====================================================
// COLOR PALETTES
// =====================================================

export const lightColors = {
  pageBg: "#f5f7fb",
  cardBg: "#ffffff",
  border: "#dddddd",
  borderSubtle: "#eeeeee",
  text: "#111111",
  mutedText: "#777777",
  inputBg: "#ffffff",
  inputBorder: "#cccccc",
  buttonBg: "#111111",
  buttonText: "#ffffff",
  hoverBg: "#f0f0f0",
  statBoxBg: "#fafafa",
  positive: "#1a7f37",
  negative: "#d1242f",
  shadow: "rgba(0, 0, 0, 0.1)"
};

export const darkColors = {
  pageBg: "#0f1117",
  cardBg: "#1a1d27",
  border: "#2a2d3a",
  borderSubtle: "#242733",
  text: "#f0f0f0",
  mutedText: "#9aa0ac",
  inputBg: "#12141c",
  inputBorder: "#3a3d4a",
  buttonBg: "#f0f0f0",
  buttonText: "#111111",
  hoverBg: "#262a38",
  statBoxBg: "#20232f",
  positive: "#3fb950",
  negative: "#f85149",
  shadow: "rgba(0, 0, 0, 0.4)"
};


// =====================================================
// PROVIDER
// =====================================================

export function ThemeProvider({ children }) {

  const [isDark, setIsDark] = useState(() => {

    const stored = localStorage.getItem("theme");

    if (stored) {
      return stored === "dark";
    }

    // Fall back to the user's system preference on first visit
    return window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    ).matches ?? false;
  });

  useEffect(() => {

    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Also set a data attribute on <html> in case you want to
    // theme any plain CSS elsewhere (scrollbars, etc.)
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );

  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}


// =====================================================
// HOOK
// =====================================================

export function useTheme() {

  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}