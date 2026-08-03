import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import { flushSync } from "react-dom";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
  toggleWithBubble: () => void;
  isTransitioning: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  toggleWithBubble: () => {},
  isTransitioning: false,
});

export const useTheme = () => useContext(ThemeContext);

const applyThemeClass = (theme: Theme) => {
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("dumpstash-theme");
    return stored === "light" || stored === "dark" ? stored : "dark";
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitioningRef = useRef(false);

  useEffect(() => {
    localStorage.setItem("dumpstash-theme", theme);
    applyThemeClass(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const toggleWithBubble = useCallback(() => {
    if (transitioningRef.current) return;

    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    const finish = () => {
      transitioningRef.current = false;
      setIsTransitioning(false);
      root.classList.remove("theme-bubble-active");
    };

    transitioningRef.current = true;
    setIsTransitioning(true);
    root.classList.add("theme-bubble-active");

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };

    if (typeof doc.startViewTransition === "function") {
      const transition = doc.startViewTransition(() => {
        flushSync(() => {
          setTheme(next);
          applyThemeClass(next);
        });
      });
      transition.finished.then(finish).catch(finish);
      return;
    }

    // Fallback: expanding bubble overlay from bottom-left
    const overlay = document.createElement("div");
    overlay.className = "theme-bubble-fallback";
    overlay.style.background = next === "light" ? "hsl(0 0% 98%)" : "hsl(0 0% 4%)";
    document.body.appendChild(overlay);

    // Force layout, then expand
    requestAnimationFrame(() => {
      overlay.classList.add("theme-bubble-fallback--expand");
    });

    window.setTimeout(() => {
      setTheme(next);
      applyThemeClass(next);
      overlay.classList.add("theme-bubble-fallback--fade");
      window.setTimeout(() => {
        overlay.remove();
        finish();
      }, 280);
    }, 520);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, toggleWithBubble, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
};
