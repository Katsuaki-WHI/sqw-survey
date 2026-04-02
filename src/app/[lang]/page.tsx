import Link from "next/link";
import { getDictionary, hasLocale, type Locale } from "./dictionaries";
import { notFound } from "next/navigation";
import LanguageToggle from "@/components/LanguageToggle";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
      <LanguageToggle />
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          {dict.home.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
          {dict.home.description}
        </p>
        <Link
          href={`/${lang}/survey`}
          className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          {dict.home.startButton}
        </Link>
      </main>
      <footer className="w-full py-6 text-center text-sm text-gray-400">
        &copy; {dict.home.footer}
      </footer>
    </div>
  );
}
