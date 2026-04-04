"use client";

import { useLocale } from "@/lib/i18n/context";

export default function PdfDownloadButton() {
  const { locale } = useLocale();
  const isEn = locale === "en";

  function handlePrint() {
    window.print();
  }

  return (
    <button
      onClick={handlePrint}
      className="rounded-full bg-gray-800 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors flex items-center gap-2 print:hidden"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {isEn ? "Save as PDF" : "PDFで保存"}
    </button>
  );
}
