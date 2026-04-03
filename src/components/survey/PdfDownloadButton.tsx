"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";

interface PdfDownloadButtonProps {
  /** ID of the DOM element to capture */
  targetId: string;
}

export default function PdfDownloadButton({ targetId }: PdfDownloadButtonProps) {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const [generating, setGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) return;

      // Dynamic imports to keep bundle small
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Capture at 2x for quality
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgW = canvas.width;
      const imgH = canvas.height;

      // A4: 210 x 297 mm
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = 210;
      const pageH = 297;
      const margin = 10;
      const contentW = pageW - margin * 2;

      // Scale image to fit page width
      const ratio = contentW / imgW;
      const scaledH = imgH * ratio;

      // Multi-page if content is taller than one page
      let yOffset = 0;
      let page = 0;
      const pageContentH = pageH - margin * 2;

      while (yOffset < scaledH) {
        if (page > 0) pdf.addPage();

        // Calculate source crop for this page
        const srcY = (yOffset / ratio);
        const srcH = Math.min(pageContentH / ratio, imgH - srcY);
        const destH = srcH * ratio;

        // Create a canvas for this page slice
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgW;
        sliceCanvas.height = Math.ceil(srcH);
        const ctx = sliceCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);
          const sliceData = sliceCanvas.toDataURL("image/png");
          pdf.addImage(sliceData, "PNG", margin, margin, contentW, destH);
        }

        yOffset += pageContentH;
        page++;
      }

      // Filename with date
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      pdf.save(`sqw-result-${dateStr}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [targetId]);

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="rounded-full bg-gray-800 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {generating ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {isEn ? "Generating..." : "生成中..."}
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isEn ? "Save as PDF" : "PDFで保存"}
        </>
      )}
    </button>
  );
}
