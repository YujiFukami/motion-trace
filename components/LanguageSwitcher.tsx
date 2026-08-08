"use client";

import { useLocale } from "@/lib/i18n/LocaleContext";
import { LOCALE_NAMES, type Locale } from "@/lib/i18n/translations";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Language / 言語"
      className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-sm text-zinc-200"
    >
      {LOCALE_NAMES.map(({ code, label }) => (
        <option key={code} value={code}>
          {label}
        </option>
      ))}
    </select>
  );
}
