import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "./dictionaries";
import { LocaleProvider } from "@/lib/i18n/context";

export async function generateStaticParams() {
  return [{ lang: "ja" }, { lang: "en" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <LocaleProvider locale={lang as Locale} dict={dict}>
      {children}
    </LocaleProvider>
  );
}
