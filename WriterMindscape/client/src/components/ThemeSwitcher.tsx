import { Sun, Moon, Coffee } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "beige", icon: Coffee, label: "Beige" },
  ] as const;

  return (
    <div className="theme-switcher">
      {themes.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          className={`theme-btn ${value} ${theme === value ? 'active' : ''}`}
          onClick={() => setTheme(value)}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}