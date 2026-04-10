"use client";

import { useLocale } from "@/lib/i18n/context";

interface PdfDownloadButtonProps {
  printTitle?: string;
}

export default function PdfDownloadButton({ printTitle }: PdfDownloadButtonProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";

  function handlePrint() {
    if (printTitle) {
      const original = document.title;
      document.title = printTitle;
      window.print();
      setTimeout(() => { document.title = original; }, 1000);
    } else {
      window.print();
    }
  }

  return (
    <button
      onClick={handlePrint}
      className="print:hidden rounded border border-gray-300 px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
    >
      {isEn ? "Save as PDF" : "PDFで保存"}
    </button>
  );
}
