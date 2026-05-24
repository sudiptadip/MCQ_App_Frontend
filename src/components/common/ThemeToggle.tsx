import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "../ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative rounded-full h-10 w-10 hover:bg-muted border border-transparent hover:border-border/40 focus-visible:ring-0 focus-visible:ring-offset-0 group transition-all duration-300 active:scale-90"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
    >
      <div className="relative h-5 w-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <Sun className="h-5 w-5 text-amber-500 transition-all duration-500 ease-out transform dark:rotate-90 dark:scale-0 rotate-0 scale-100" />
        
        {/* Moon Icon */}
        <Moon className="absolute h-5 w-5 text-indigo-400 transition-all duration-500 ease-out transform dark:rotate-0 dark:scale-100 -rotate-90 scale-0" />
      </div>
    </Button>
  );
}
