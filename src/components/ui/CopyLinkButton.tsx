"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";

export default function CopyLinkButton({ text }: { text: string }) {
  const { dict } = useLocale();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
    >
      {copied ? dict.team.copied : dict.team.copyLink}
    </button>
  );
}
