"use client";

import Image from "next/image";
import { useLocale } from "@/lib/i18n/LocaleContext";

export default function Footer() {
  const { t } = useLocale();

  return (
    <a
      href="https://www.softex-celware.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
    >
      <span className="rounded-md bg-white px-3 py-1.5">
        <Image
          src="/softex-celware-logo.png"
          alt="SoftexCelware"
          width={140}
          height={28}
          className="h-5 w-auto"
        />
      </span>
      <span className="text-sm text-zinc-300">{t("footer.visitSite")}</span>
    </a>
  );
}
