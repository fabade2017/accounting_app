/*import React, { createContext, useContext, useState, useEffect } from "react";

// ---------------------------
// THEME INTERFACE
// ---------------------------
export interface Theme {
  ThemeId?: number;
  ThemeName: string;
  PrimaryColor: string;
  BackgroundColor: string;
  TextColor: string;
  CardColor: string;
  SidebarBg: string;
  ChartColor: string;
}

// ---------------------------
// CREATE THE CONTEXT
// ---------------------------
export const ThemeContext = createContext<{
  theme: Theme;
  applyThemeToDOM: (theme: Theme) => void;
  setTheme: (theme: Theme) => void;
} | null>(null);

// ---------------------------
// DEFAULT THEME
// ---------------------------
const defaultTheme: Theme = {
  ThemeName: "Default",
  PrimaryColor: "#1677ff",
  BackgroundColor: "#ffffff",
  TextColor: "#000000",
  CardColor: "#ffffff",
  SidebarBg: "#001529",
  ChartColor: "#1677ff",
};

// ---------------------------
// PROVIDER
// ---------------------------
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Load Theme from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("activeTheme");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTheme(parsed);
      applyThemeToDOM(parsed);
    } else {
      applyThemeToDOM(defaultTheme);
    }
  }, []);

  // Apply to DOM
  const applyThemeToDOM = (theme: Theme) => {
    if (!theme) return;

    document.documentElement.style.setProperty("--primary-color", theme.PrimaryColor);
    document.documentElement.style.setProperty("--background-color", theme.BackgroundColor);
    document.documentElement.style.setProperty("--text-color", theme.TextColor);
    document.documentElement.style.setProperty("--card-color", theme.CardColor);
    document.documentElement.style.setProperty("--sidebar-bg", theme.SidebarBg);
    document.documentElement.style.setProperty("--chart-color", theme.ChartColor);

    setTheme(theme);
    localStorage.setItem("activeTheme", JSON.stringify(theme));
  };

  return (
    <ThemeContext.Provider value={{ theme, applyThemeToDOM, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
*/
// ---------------------------
// CUSTOM HOOK
// ---------------------------

// src/contexts/ThemeContext.tsx
import React, { createContext, ReactNode, useContext, useState } from "react";

export interface Theme {
  ThemeId?: number;
  ThemeName: string;
  PrimaryColor: string;
  BackgroundColor: string;
  TextColor: string;
  CardColor: string;
  SidebarBg: string;
  ChartColor: string;
}
interface ThemeContextType {
  theme: Theme | null;
  setTheme: React.Dispatch<React.SetStateAction<Theme | null>>;
  applyThemeToDOM: (theme: Theme | null) => void;
}

// export const ThemeContext = createContext<any>(null);
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
interface ThemeProviderProps {
  children: ReactNode;
}

// export const ThemeProvider = ({ children }) => {
//   const [theme, setTheme] = useState(null);

//   const applyThemeToDOM = (t: any) => {


//     if (!t) return;

//     const root = document.documentElement;

//     root.style.setProperty("--primary-color", t.PrimaryColor);
//     root.style.setProperty("--background-color", t.BackgroundColor);
    
//     root.style.setProperty("--text-color", t.TextColor);
//     root.style.setProperty("--card-color", t.CardColor);
//     root.style.setProperty("--sidebar-bg", t.SidebarBg);
//     root.style.setProperty("--chart-color", t.ChartColor);  //console.log(JSON.stringify( t));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, setTheme, applyThemeToDOM }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme | null>(null);

  const applyThemeToDOM = (t: Theme | null) => {
    if (!t) return;

    const root = document.documentElement;

    root.style.setProperty("--primary-color", t.PrimaryColor);
    root.style.setProperty("--background-color", t.BackgroundColor);
    root.style.setProperty("--text-color", t.TextColor);
    root.style.setProperty("--card-color", t.CardColor);
    root.style.setProperty("--sidebar-bg", t.SidebarBg);
    root.style.setProperty("--chart-color", t.ChartColor);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyThemeToDOM }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
