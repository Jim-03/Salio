import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext<boolean>(true);

/**
 * Provides the current theme (light or dark) to its children components.
 * It determines the theme based on the system's color scheme.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the theme provider.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const scheme = useColorScheme();

  const isLight = scheme === "light";

  return (
    <ThemeContext.Provider value={isLight}>{children}</ThemeContext.Provider>
  );
}

/**
 * A hook that provides the current theme.
 *
 * @returns {boolean} - True if the current theme is light, false otherwise.
 * @throws {Error} - Throws an error if used outside of a ThemeProvider.
 */
export const useLightTheme = (): boolean => {
  const theme = useContext(ThemeContext);

  if (theme === null) {
    throw new Error("useLightTheme may only be used in ThemeProvider");
  }
  return theme;
};
