"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { createTeam } from "@/lib/actions/team";
import LanguageToggle from "@/components/LanguageToggle";
import { useRouter } from "next/navigation";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

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

    const params = new URLSearchParams({
      invite: result.inviteCode,
      admin: result.adminToken,
    });
    router.push(`/${locale}/team/created?${params.toString()}`);
  }

  const industries = [
    { value: "manufacturing", label: t.industryManufacturing },
    { value: "it", label: t.industryIT },
    { value: "retail", label: t.industryRetail },
    { value: "service", label: t.industryService },
    { value: "healthcare", label: t.industryHealthcare },
    { value: "education", label: t.industryEducation },
    { value: "construction", label: t.industryConstruction },
    { value: "finance", label: t.industryFinance },
    { value: "other", label: t.industryOther },
  ];

  const companySizes = [
    { value: "1-10", label: t.companySize1_10 },
    { value: "11-30", label: t.companySize11_30 },
    { value: "31-100", label: t.companySize31_100 },
    { value: "101-300", label: t.companySize101_300 },
    { value: "301+", label: t.companySize301plus },
  ];

  const surveyPurposes = [
    { value: "regular", label: t.surveyPurposeRegular },
    { value: "pre_workshop", label: t.surveyPurposePreWS },
    { value: "improvement", label: t.surveyPurposeImprovement },
    { value: "other", label: t.surveyPurposeOther },
  ];

  return (
    <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black px-6 py-16">
      <LanguageToggle />
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          {t.createTitle}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* ==================== */}
          {/* Required Fields      */}
          {/* ==================== */}
          <fieldset className="flex flex-col gap-5">
            <legend className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
              {t.requiredFields}
            </legend>

            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.teamNameLabel} <span className="text-red-500">*</span>
              </label>
              <input name="name" type="text" required placeholder={t.teamNamePlaceholder} className={INPUT_CLASS} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.descriptionLabel} <span className="text-red-500">*</span>
              </label>
              <input name="description" type="text" required placeholder={t.descriptionPlaceholder} className={INPUT_CLASS} />
            </div>

            {/* Leader Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.leaderNameLabel} <span className="text-red-500">*</span>
              </label>
              <input name="leader_name" type="text" required placeholder={t.leaderNamePlaceholder} className={INPUT_CLASS} />
              <p className="text-xs text-gray-500 mt-1">{t.leaderNameHint}</p>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.industryLabel} <span className="text-red-500">*</span>
              </label>
              <select name="industry" required defaultValue="" className={INPUT_CLASS}>
                <option value="" disabled>{t.industryPlaceholder}</option>
                {industries.map((i) => (
                  <option key={i.value} value={i.value}>{i.label}</option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.companySizeLabel} <span className="text-red-500">*</span>
              </label>
              <select name="company_size" required defaultValue="" className={INPUT_CLASS}>
                <option value="" disabled>{t.companySizePlaceholder}</option>
                {companySizes.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Expected Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.expectedMembersLabel} <span className="text-red-500">*</span>
              </label>
              <input name="expected_members" type="number" required min={1} max={9999} placeholder={t.expectedMembersPlaceholder} className={INPUT_CLASS} />
            </div>
          </fieldset>

          {/* ==================== */}
          {/* Optional Fields      */}
          {/* ==================== */}
          <fieldset className="flex flex-col gap-5 border-t border-gray-200 dark:border-gray-700 pt-6">
            <legend className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              {t.optionalFields}
            </legend>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.companyNameLabel}
              </label>
              <input name="company_name" type="text" placeholder={t.companyNamePlaceholder} className={INPUT_CLASS} />
            </div>

            {/* Invite Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.inviteMessageLabel}
              </label>
              <textarea name="invite_message" rows={2} placeholder={t.inviteMessagePlaceholder} className={INPUT_CLASS} />
              <p className="text-xs text-gray-500 mt-1">{t.inviteMessageHint}</p>
            </div>

            {/* Survey Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.surveyPurposeLabel}
              </label>
              <select name="survey_purpose" defaultValue="" className={INPUT_CLASS}>
                <option value="">{t.surveyPurposePlaceholder}</option>
                {surveyPurposes.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.deadlineLabel}
              </label>
              <input name="deadline" type="datetime-local" className={INPUT_CLASS} />
            </div>

            {/* Release Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.releaseModeLabel}
              </label>
              <div className="flex flex-col gap-2">
                {(["manual", "on_deadline", "immediate"] as const).map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input type="radio" name="release_mode" value={mode} defaultChecked={mode === "manual"} className="text-blue-600" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {mode === "immediate" ? t.releaseModeImmediate : mode === "on_deadline" ? t.releaseModeOnDeadline : t.releaseModeManual}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-600">{error}</p>}

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
