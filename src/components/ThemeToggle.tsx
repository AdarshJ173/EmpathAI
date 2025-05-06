"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <div className={`absolute inset-0 transition-all duration-300 transform ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
          <Moon className="w-full h-full" />
        </div>
        <div className={`absolute inset-0 transition-all duration-300 transform ${theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
          <Sun className="w-full h-full" />
        </div>
      </div>
    </button>
  );
};

export { ThemeToggle }; 