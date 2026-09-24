import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/cn";
import { SUPPORTED_LANGUAGES } from "../../i18n";

/** English / ភាសាខ្មែរ / 中文 picker. */
export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = i18n.language.split("-")[0];
  const current =
    SUPPORTED_LANGUAGES.find((language) => language.code === active) ??
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t("common.language")}
        className="flex h-8 items-center gap-2 border border-border px-2.5 font-heading text-[13px] text-main transition-colors hover:bg-hover"
      >
        <Globe className="size-4 text-muted" aria-hidden />
        <span>{current.short}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 w-44 overflow-hidden border border-border bg-app shadow-lg"
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              role="menuitemradio"
              aria-checked={language.code === active}
              onClick={() => {
                i18n.changeLanguage(language.code);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-hover",
                language.code === active
                  ? "text-primary"
                  : "text-main",
              )}
            >
              {language.label}
              {language.code === active && (
                <Check className="size-4" aria-hidden />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
