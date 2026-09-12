import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { applyThemeClass, resolvedTheme, usePrefs } from "@/lib/haven/prefs";

export function ThemeRoot({ children }: { children: ReactNode }) {
  const prefs = usePrefs();
  const theme = resolvedTheme(prefs.theme);

  useEffect(() => {
    const apply = () => applyThemeClass(resolvedTheme(prefs.theme));
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [prefs.theme]);

  return (
    <>
      {children}
      <Toaster
        theme={theme}
        toastOptions={{
          className: "glass text-fog border-0",
        }}
      />
    </>
  );
}

export const THEME_BOOT = `(()=>{try{var k="haven-prefs-v1";var p=JSON.parse(localStorage.getItem(k)||"{}");var t=p.theme||"system";var dark=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",dark);r.classList.toggle("light",!dark);r.style.colorScheme=dark?"dark":"light";}catch(e){document.documentElement.classList.add("dark")}})();`;
