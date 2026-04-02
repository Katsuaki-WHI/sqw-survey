"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import LanguageToggle from "@/components/LanguageToggle";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import Link from "next/link";

function TeamCreatedContent() {
  const { locale, dict } = useLocale();
  const t = dict.team;
  const searchParams = useSearchParams();

  const inviteCode = searchParams.get("invite") || "";
  const adminToken = searchParams.get("admin") || "";

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteUrl = `${origin}/${locale}/team/join/${inviteCode}`;
  const adminUrl = `${origin}/${locale}/team/admin/${adminToken}`;

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
        {t.createdTitle}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
        {t.createdDescription}
      </p>

      <div className="flex flex-col gap-6">
        {/* Invite URL */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.inviteUrlLabel}
          </label>
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
            />
            <CopyLinkButton text={inviteUrl} />
          </div>
        </div>

        {/* Admin URL */}
        <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.adminUrlLabel}
          </label>
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={adminUrl}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800"
            />
            <CopyLinkButton text={adminUrl} />
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
            {t.adminUrlWarning}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href={`/${locale}/team/admin/${adminToken}`}
          className="rounded-full bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 transition-colors inline-block"
        >
          {t.goToAdmin}
        </Link>
      </div>
    </div>
  );
}

export default function TeamCreatedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black px-6 py-16">
      <LanguageToggle />
      <Suspense fallback={<div className="text-gray-400">...</div>}>
        <TeamCreatedContent />
      </Suspense>
    </div>
  );
}
