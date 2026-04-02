"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { createTeam } from "@/lib/actions/team";
import LanguageToggle from "@/components/LanguageToggle";
import { useRouter } from "next/navigation";

export default function TeamCreatePage() {
  const { locale, dict } = useLocale();
  const t = dict.team;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createTeam(formData);

    if ("error" in result) {
      setError(result.error || "Unknown error");
      setLoading(false);
      return;
    }

    // Navigate to success page with tokens in URL params
    const params = new URLSearchParams({
      invite: result.inviteCode,
      admin: result.adminToken,
    });
    router.push(`/${locale}/team/created?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black px-6 py-16">
      <LanguageToggle />
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          {t.createTitle}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.teamNameLabel}
            </label>
            <input
              name="name"
              type="text"
              required
              placeholder={t.teamNamePlaceholder}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.deadlineLabel}
            </label>
            <input
              name="deadline"
              type="datetime-local"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {loading ? t.creating : t.createButton}
          </button>
        </form>
      </div>
    </div>
  );
}
