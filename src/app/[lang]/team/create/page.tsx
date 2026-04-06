"use client";

import { useState, useRef } from "react";
import { useLocale } from "@/lib/i18n/context";
import { createProject } from "@/lib/actions/project";
import LanguageToggle from "@/components/LanguageToggle";
import CopyLinkButton from "@/components/ui/CopyLinkButton";
import Link from "next/link";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const INPUT_ERROR_CLASS =
  "w-full rounded-lg border-2 border-red-500 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent";

type FieldErrors = Record<string, string>;

interface TeamRow {
  name: string;
  expectedMembers: string;
}

interface CreatedResult {
  adminToken: string;
  teams: { name: string; inviteCode: string; expectedMembers: number }[];
}

export default function TeamCreatePage() {
  const { locale, dict } = useLocale();
  const t = dict.team;
  const isEn = locale === "en";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [created, setCreated] = useState<CreatedResult | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // STEP 1 state
  const [projectName, setProjectName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [deadline, setDeadline] = useState("");
  const [releaseMode, setReleaseMode] = useState("manual");
  const [inviteMessage, setInviteMessage] = useState("");
  const [surveyPurpose, setSurveyPurpose] = useState("");
  const [surveyVersion, setSurveyVersion] = useState<"26" | "40">("26");
  const [includeManagement, setIncludeManagement] = useState(false);
  const [includeQualitative, setIncludeQualitative] = useState(false);
  const [qualitativeQs, setQualitativeQs] = useState<string[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);

  // STEP 2 state
  const [teams, setTeams] = useState<TeamRow[]>([{ name: "", expectedMembers: "" }]);

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

  function handleNext1() {
    const errs: FieldErrors = {};
    if (!email) errs.email = t.errorEmail;
    if (!industry) errs.industry = t.errorIndustry;
    if (!companySize) errs.companySize = t.errorCompanySize;
    if (!deadline) errs.deadline = t.errorDeadline;
    if (!releaseMode) errs.releaseMode = t.errorReleaseMode;

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Scroll to first error
      const firstKey = Object.keys(errs)[0];
      const el = formRef.current?.querySelector(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError("");
    setStep(2);
  }

  function handleNext2() {
    const valid = teams.every((t) => t.name.trim() && parseInt(t.expectedMembers) > 0);
    if (!valid) {
      setError(isEn ? "Please fill in all team fields" : "すべてのチーム情報を入力してください");
      return;
    }
    setError("");
    setStep(3);
  }

  async function handleCreate() {
    setLoading(true);
    setError("");

    const result = await createProject({
      name: projectName,
      facilitatorEmail: email,
      companyName,
      industry,
      companySize,
      deadline,
      releaseMode,
      inviteMessage,
      surveyPurpose,
      locale,
      surveyVersion,
      includeManagementTrust: includeManagement,
      qualitativeQuestions: includeQualitative ? qualitativeQs.filter((q) => q.trim()) : [],
      teams: teams.map((t) => ({
        name: t.name.trim(),
        expectedMembers: parseInt(t.expectedMembers) || 1,
      })),
    });

    if ("error" in result) {
      setError(result.error || "Unknown error");
      setLoading(false);
      return;
    }

    setCreated(result);
    setLoading(false);
  }

  function updateTeam(index: number, field: keyof TeamRow, value: string) {
    setTeams((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTeam() {
    setTeams((prev) => [...prev, { name: "", expectedMembers: "" }]);
  }

  function removeTeam(index: number) {
    if (teams.length <= 1) return;
    setTeams((prev) => prev.filter((_, i) => i !== index));
  }

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            s === step ? "bg-blue-600 text-white" : s < step ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
          }`}>
            {s < step ? "✓" : s}
          </div>
          {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
        </div>
      ))}
    </div>
  );

  // ========================
  // CREATED - Success screen
  // ========================
  if (created) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const adminUrl = `${origin}/${locale}/team/admin/${created.adminToken}`;

    return (
      <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black px-6 py-16">
        <LanguageToggle />
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            {t.projectCreatedTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">{t.projectCreatedDesc}</p>

          {/* Admin URL */}
          <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 p-4 mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.adminUrlLabel}</label>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{t.adminUrlDesc}</p>
            <div className="flex gap-2 items-center">
              <input readOnly value={adminUrl} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800" />
              <CopyLinkButton text={adminUrl} />
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">{t.adminUrlWarning}</p>
          </div>

          {/* Team invite URLs */}
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.inviteUrlsTitle}</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{t.inviteUrlsDesc}</p>
            <div className="flex flex-col gap-4">
              {created.teams.map((team) => {
                const inviteUrl = `${origin}/${locale}/team/join/${team.inviteCode}`;
                return (
                  <div key={team.inviteCode} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {team.name} ({team.expectedMembers}{isEn ? " members" : "名"})
                    </p>
                    <div className="flex gap-2 items-center">
                      <input readOnly value={inviteUrl} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800" />
                      <CopyLinkButton text={inviteUrl} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/${locale}/team/admin/${created.adminToken}`}
              className="rounded-full bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 transition-colors inline-block"
            >
              {t.goToAdmin}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black px-6 py-16">
      <LanguageToggle />
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
          {t.createTitle}
        </h1>

        <StepIndicator />

        {/* ================ */}
        {/* STEP 1            */}
        {/* ================ */}
        {step === 1 && (
          <div ref={formRef} className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.step1Title}</h2>

            {/* Email */}
            <div data-field="email">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.adminEmailLabel} <span className="text-red-500">*</span>
              </label>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }} placeholder={t.adminEmailPlaceholder} className={fieldErrors.email ? INPUT_ERROR_CLASS : INPUT_CLASS} />
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Survey Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.projectNameLabel}</label>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder={t.projectNamePlaceholder} className={INPUT_CLASS} />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.companyNameLabel}</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t.companyNamePlaceholder} className={INPUT_CLASS} />
            </div>

            {/* Industry */}
            <div data-field="industry">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.industryLabel} <span className="text-red-500">*</span>
              </label>
              <select value={industry} onChange={(e) => { setIndustry(e.target.value); setFieldErrors((p) => ({ ...p, industry: "" })); }} className={fieldErrors.industry ? INPUT_ERROR_CLASS : INPUT_CLASS}>
                <option value="">{t.industryPlaceholder}</option>
                {industries.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
              {fieldErrors.industry && <p className="text-xs text-red-500 mt-1">{fieldErrors.industry}</p>}
            </div>

            {/* Company Size */}
            <div data-field="companySize">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.companySizeLabel} <span className="text-red-500">*</span>
              </label>
              <select value={companySize} onChange={(e) => { setCompanySize(e.target.value); setFieldErrors((p) => ({ ...p, companySize: "" })); }} className={fieldErrors.companySize ? INPUT_ERROR_CLASS : INPUT_CLASS}>
                <option value="">{t.companySizePlaceholder}</option>
                {companySizes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {fieldErrors.companySize && <p className="text-xs text-red-500 mt-1">{fieldErrors.companySize}</p>}
            </div>

            {/* Deadline */}
            <div data-field="deadline">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.deadlineLabel.replace("（任意）", "").replace("(optional)", "")} <span className="text-red-500">*</span>
              </label>
              <input type="datetime-local" value={deadline} onChange={(e) => { setDeadline(e.target.value); setFieldErrors((p) => ({ ...p, deadline: "" })); }} className={fieldErrors.deadline ? INPUT_ERROR_CLASS : INPUT_CLASS} />
              {fieldErrors.deadline && <p className="text-xs text-red-500 mt-1">{fieldErrors.deadline}</p>}
            </div>

            {/* Release Mode */}
            <div data-field="releaseMode">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.releaseModeLabel} <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2">
                {(["manual", "all_completed", "on_deadline"] as const).map((mode) => (
                  <label key={mode} className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${fieldErrors.releaseMode ? "border-red-500" : "border-gray-200 dark:border-gray-700"}`}>
                    <input type="radio" checked={releaseMode === mode} onChange={() => { setReleaseMode(mode); setFieldErrors((p) => ({ ...p, releaseMode: "" })); }} className="text-blue-600 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {mode === "all_completed" ? t.releaseModeAllCompleted : mode === "on_deadline" ? t.releaseModeOnDeadline : t.releaseModeManual}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {mode === "all_completed" ? t.releaseModeAllCompletedDesc : mode === "on_deadline" ? t.releaseModeOnDeadlineDesc : t.releaseModeManualDesc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {fieldErrors.releaseMode && <p className="text-xs text-red-500 mt-1">{fieldErrors.releaseMode}</p>}
            </div>

            {/* Survey Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.surveyVersionLabel} <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2">
                {(["26", "40"] as const).map((v) => (
                  <label key={v} className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${surveyVersion === v ? "border-blue-500" : "border-gray-200 dark:border-gray-700"}`}>
                    <input type="radio" checked={surveyVersion === v} onChange={() => setSurveyVersion(v)} className="text-blue-600 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {v === "26" ? t.surveyVersion26 : t.surveyVersion40}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {v === "26" ? t.surveyVersion26Desc : t.surveyVersion40Desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Settings (collapsible) */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                type="button"
                onClick={() => setOptionsOpen(!optionsOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <span className={`transition-transform ${optionsOpen ? "rotate-90" : ""}`}>&#9654;</span>
                {t.optionalSettingsLabel}
              </button>

              {optionsOpen && (
                <div className="mt-4 flex flex-col gap-4">
                  {/* Management Trust */}
                  <label className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="checkbox" checked={includeManagement} onChange={(e) => setIncludeManagement(e.target.checked)} className="mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{t.managementTrustLabel}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{t.managementTrustDesc}</p>
                    </div>
                  </label>

                  {/* Qualitative Questions */}
                  <label className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input type="checkbox" checked={includeQualitative} onChange={(e) => {
                      setIncludeQualitative(e.target.checked);
                      if (e.target.checked && qualitativeQs.length === 0) {
                        setQualitativeQs([t.qualitativeDefault]);
                      }
                    }} className="mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{t.qualitativeLabel}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{t.qualitativeDesc}</p>
                    </div>
                  </label>

                  {/* Qualitative question inputs */}
                  {includeQualitative && (
                    <div className="ml-8 flex flex-col gap-3">
                      <p className="text-xs text-blue-600 dark:text-blue-400">{t.qualitativeAiHint}</p>
                      {qualitativeQs.map((q, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={q}
                            onChange={(e) => setQualitativeQs((prev) => prev.map((v, j) => j === i ? e.target.value : v))}
                            className={INPUT_CLASS}
                          />
                          {qualitativeQs.length > 1 && (
                            <button type="button" onClick={() => setQualitativeQs((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-500 text-lg px-2">×</button>
                          )}
                        </div>
                      ))}
                      {qualitativeQs.length < 5 && (
                        <button type="button" onClick={() => setQualitativeQs((prev) => [...prev, ""])} className="text-sm text-blue-600 hover:text-blue-500">
                          {t.addQuestion}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Leader definition hint */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">{t.leaderDefinitionTitle}</p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">{t.leaderDefinitionHint}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 whitespace-pre-line">{t.leaderDefinitionExample}</p>
            </div>

            {/* Invite Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.inviteMessageLabel}</label>
              <textarea rows={2} value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} placeholder={t.inviteMessagePlaceholder} className={INPUT_CLASS} />
            </div>

            {/* Survey Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.surveyPurposeLabel}</label>
              <select value={surveyPurpose} onChange={(e) => setSurveyPurpose(e.target.value)} className={INPUT_CLASS}>
                <option value="">{t.surveyPurposePlaceholder}</option>
                {surveyPurposes.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <button onClick={handleNext1} className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors">
              {t.nextStep}
            </button>
          </div>
        )}

        {/* ================ */}
        {/* STEP 2            */}
        {/* ================ */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.step2Title}</h2>

            {teams.map((team, i) => (
              <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {isEn ? `Team ${i + 1}` : `チーム ${i + 1}`}
                  </span>
                  {teams.length > 1 && (
                    <button onClick={() => removeTeam(i)} className="text-xs text-red-500 hover:text-red-400">
                      {t.removeTeam}
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t.teamNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={team.name} onChange={(e) => updateTeam(i, "name", e.target.value)} placeholder={t.teamNamePlaceholder} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t.expectedMembersLabel} <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min={1} value={team.expectedMembers} onChange={(e) => updateTeam(i, "expectedMembers", e.target.value)} placeholder={t.expectedMembersPlaceholder} className={INPUT_CLASS} />
                </div>
              </div>
            ))}

            <button onClick={addTeam} type="button" className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
              {t.addTeam}
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setError(""); setStep(1); }} className="flex-1 rounded-full border-2 border-gray-300 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {t.prevStep}
              </button>
              <button onClick={handleNext2} className="flex-1 rounded-full bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-500 transition-colors">
                {t.nextStep}
              </button>
            </div>
          </div>
        )}

        {/* ================ */}
        {/* STEP 3            */}
        {/* ================ */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t.step3Title}</h2>

            {/* Project summary */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">{t.projectSummary}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {projectName && <><span className="text-gray-500">{t.projectNameLabel.replace("（任意）", "").replace("(optional)", "")}</span><span className="text-gray-900 dark:text-white">{projectName}</span></>}
                <span className="text-gray-500">{isEn ? "Email" : "メール"}</span><span className="text-gray-900 dark:text-white">{email}</span>
                {companyName && <><span className="text-gray-500">{t.companyNameLabel.replace("（任意）", "").replace("(optional)", "")}</span><span className="text-gray-900 dark:text-white">{companyName}</span></>}
                <span className="text-gray-500">{t.industryLabel}</span><span className="text-gray-900 dark:text-white">{industries.find((i) => i.value === industry)?.label}</span>
                <span className="text-gray-500">{t.companySizeLabel}</span><span className="text-gray-900 dark:text-white">{companySizes.find((s) => s.value === companySize)?.label}</span>
                <span className="text-gray-500">{isEn ? "Deadline" : "回答期限"}</span><span className="text-gray-900 dark:text-white">{deadline ? new Date(deadline).toLocaleString(isEn ? "en-US" : "ja-JP") : "-"}</span>
              </div>
            </div>

            {/* Teams summary */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">{t.teamsSummary}</h3>
              <div className="flex flex-col gap-2">
                {teams.map((team, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-900 dark:text-white">{team.name}</span>
                    <span className="text-gray-500">{team.expectedMembers}{isEn ? " members" : "名"}</span>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setError(""); setStep(2); }} className="flex-1 rounded-full border-2 border-gray-300 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {t.prevStep}
              </button>
              <button onClick={handleCreate} disabled={loading} className="flex-1 rounded-full bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50">
                {loading ? t.creating : t.confirmCreate}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
