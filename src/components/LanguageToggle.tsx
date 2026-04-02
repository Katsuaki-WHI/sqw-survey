"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";

export default function LanguageToggle() {
  const { locale, dict } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function handleSwitch() {
    const newLocale = locale === "ja" ? "en" : "ja";
    // Replace the locale segment in the path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  }

  return (
    <button
      onClick={handleSwitch}
      className="fixed top-4 right-4 z-50 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      aria-label="Switch language"
    >
      {dict.common.langSwitch}
    </button>
  );
}
