import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/cn";
import { useThemeStore, type ThemeMode } from "../../stores/theme.store";

const options: { mode: ThemeMode; icon: typeof Sun; labelKey: string }[] = [
  { mode: "light", icon: Sun, labelKey: "common.themeLight" },
  { mode: "dark", icon: Moon, labelKey: "common.themeDark" },
  { mode: "system", icon: Monitor, labelKey: "common.themeSystem" },
];

/** Three-way switch: light / dark / follow the OS. */
export const ThemeToggle = () => {
  const { t } = useTranslation();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <div
      role="group"
      aria-label={t("common.theme")}
      className="flex items-center border border-border"
    >
      {options.map(({ mode: optionMode, icon: Icon, labelKey }) => {
        const isActive = mode === optionMode;
        return (
          <button
            key={optionMode}
            type="button"
            onClick={() => setMode(optionMode)}
            aria-pressed={isActive}
            title={t(labelKey)}
            aria-label={t(labelKey)}
            className={cn(
              "flex size-8 items-center justify-center transition-colors",
              isActive
                ? "bg-primary text-primary-fg"
                : "text-muted hover:bg-hover hover:text-main",
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
};
