"use client";

import { useState } from "react";
import { QUESTIONS, SCALE_LABELS, getQuestionsForConfig, type SurveyConfig } from "@/lib/survey/questions";
import {
  calcTeamAverage,
  calcWagonSpeed,
  calcCategoryScores,
} from "@/lib/survey/scoring";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import LanguageToggle from "@/components/LanguageToggle";
import ResultsView, { type ResultsData } from "./ResultsView";

export type Answers = Record<number, number | string>;

interface TeamContext {
  leaderName: string | null;
  notes: string | null;
}

interface SurveyFlowProps {
  onSubmit?: (answers: Answers, qualitativeData?: Record<number, string>) => Promise<ResultsData | void>;
  completedExtra?: React.ReactNode;
  teamContext?: TeamContext;
  /** Survey configuration — controls which questions are shown */
  surveyConfig?: SurveyConfig;
  /** Custom qualitative questions from team settings */
  qualitativeQuestions?: string[];
}

export default function SurveyFlow({ onSubmit, completedExtra, teamContext, surveyConfig, qualitativeQuestions }: SurveyFlowProps) {
  const { locale, dict } = useLocale();
  const t = dict.survey;
  const isEn = locale === "en";

  // Build question lists based on config
  const config = surveyConfig || { version: "26" as const, includeManagementTrust: false, qualitativeQuestions: [] };
  const configQuestions = getQuestionsForConfig(config);
  const SCALE_QUESTIONS = configQuestions.filter((q) => q.type === "scale");
  const hasQualitative = (qualitativeQuestions && qualitativeQuestions.length > 0);
  // Steps: scale questions + 1 (qualitative step or submit step)
  const TOTAL_STEPS = SCALE_QUESTIONS.length + 1;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [qualitativeAnswers, setQualitativeAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);

  const isQualitativeStep = hasQualitative && step === SCALE_QUESTIONS.length;
  const isScaleStep = step < SCALE_QUESTIONS.length;
  const currentQuestion = isScaleStep ? SCALE_QUESTIONS[step] : null;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  function handleScaleAnswer(value: number) {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    const isLastScale = step === SCALE_QUESTIONS.length - 1;

    if (isLastScale && !hasQualitative) {
      // Last scale question + no qualitative → auto-submit with newAnswers
      doSubmit(newAnswers);
    } else {
      setStep(step + 1);
    }
  }

  async function doSubmit(overrideAnswers?: Answers) {
    setSubmitting(true);
    const submitAnswers = overrideAnswers || answers;
    try {
      let results: ResultsData | null = null;

      if (onSubmit) {
        const submitted = await onSubmit(submitAnswers, hasQualitative ? qualitativeAnswers : undefined);
        if (submitted) {
          results = submitted;
        }
      }

      // Build scale answers for local enrichment
      if (results && !results.questionScores) {
        const scaleAnswers: Record<number, number> = {};
        for (const [key, val] of Object.entries(submitAnswers)) {
          if (typeof val === "number") {
            scaleAnswers[Number(key)] = val;
          }
        }
        results.questionScores = scaleAnswers;

        if (results.managementAverage == null) {
          const mgmtIds = [27, 28, 29, 30, 31];
          const mgmtScores = mgmtIds.map((id) => scaleAnswers[id]).filter((v) => v != null);
          results.managementAverage =
            mgmtScores.length > 0
              ? Math.round((mgmtScores.reduce((a, b) => a + b, 0) / mgmtScores.length) * 100) / 100
              : null;
        }

        if (!results.engagementPoints || results.engagementPoints.length === 0) {
          const direction = Math.max(1, scaleAnswers[2] ?? 1);
          const q13 = scaleAnswers[13] ?? 1;
          const q19 = scaleAnswers[19] ?? 1;
          const contribution = Math.max(1, (q13 + q19) / 2);
          const happiness = scaleAnswers[26] ?? 1;
          results.engagementPoints = [{ direction, contribution, happiness, isSelf: true }];
        }
      }

      if (!results) {
        const scaleAnswers: Record<number, number> = {};
        for (const [key, val] of Object.entries(submitAnswers)) {
          if (typeof val === "number") {
            scaleAnswers[Number(key)] = val;
          }
        }
        const teamAverage = calcTeamAverage(scaleAnswers);
        const wagonSpeed = calcWagonSpeed(teamAverage);
        const categoryScores = calcCategoryScores(scaleAnswers);

        const mgmtIds = [27, 28, 29, 30, 31];
        const mgmtScores = mgmtIds.map((id) => scaleAnswers[id]).filter((v) => v != null);
        const managementAverage =
          mgmtScores.length > 0
            ? Math.round((mgmtScores.reduce((a, b) => a + b, 0) / mgmtScores.length) * 100) / 100
            : null;

        const questionScores: Record<number, number> = {};
        for (const [key, val] of Object.entries(scaleAnswers)) {
          questionScores[Number(key)] = val;
        }

        const direction = Math.max(1, questionScores[2] ?? 1);
        const q13 = questionScores[13] ?? 1;
        const q19 = questionScores[19] ?? 1;
        const contribution = Math.max(1, (q13 + q19) / 2);
        const happiness = questionScores[26] ?? 1;
        const engagementPoints = [{ direction, contribution, happiness, isSelf: true }];

        results = { teamAverage, wagonSpeed, categoryScores, managementAverage, questionScores, engagementPoints };
      }

      setResultsData(results);
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  }

  // handleSubmit is an alias for doSubmit (for button onClick)
  const handleSubmit = () => doSubmit();

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function questionLabel(current: number, total: number) {
    return t.questionOf
      .replace("{current}", String(current))
      .replace("{total}", String(total));
  }

  if (completed && resultsData) {
    return (
      <div className="flex flex-1 flex-col items-center px-6 py-12 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
        <LanguageToggle />

        {/* Privacy notice for team surveys */}
        <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 max-w-2xl text-center">
          {t.privateNotice}
        </div>

        <ResultsView
          data={resultsData}
          title={t.yourResults}
          mode="individual"
        />

        <div className="flex flex-col items-center gap-4 mt-8">
          {completedExtra}
          <Link
            href={`/${locale}`}
            className="rounded-full bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 transition-colors"
          >
            {t.backToTop}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <LanguageToggle />
      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-800 h-2">
        <div
          className="bg-blue-600 h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Team context banner */}
      {teamContext && step === 0 && (
        <div className="w-full max-w-2xl mx-auto px-6 pt-4">
          {teamContext.leaderName && (
            <p className="text-sm text-blue-600 dark:text-blue-400 text-center mb-1">
              {dict.team.invitedBy.replace("{leaderName}", teamContext.leaderName)}
            </p>
          )}
          {teamContext.notes && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 px-4 py-2 text-sm text-yellow-800 dark:text-yellow-300 text-center">
              <span className="font-medium">{dict.team.surveyNotes}:</span> {teamContext.notes}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Scale questions */}
        {isScaleStep && currentQuestion && (
          <>
            <p className="text-sm font-medium text-blue-600 mb-2">
              {isEn ? currentQuestion.wagonPartEn : currentQuestion.wagonPart} -{" "}
              {isEn
                ? currentQuestion.categoryLabelEn
                : currentQuestion.categoryLabel}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {questionLabel(step + 1, TOTAL_STEPS)}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8 leading-relaxed">
              {isEn ? currentQuestion.textEn : currentQuestion.text}
            </h2>
            <div className="flex flex-col gap-3 w-full max-w-md">
              {SCALE_LABELS.map(({ value, label, labelEn }) => (
                <button
                  key={value}
                  onClick={() => handleScaleAnswer(value)}
                  className={`w-full rounded-lg border-2 px-6 py-4 text-left transition-colors ${
                    answers[currentQuestion.id] === value
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {value}.
                  </span>{" "}
                  <span className="text-gray-700 dark:text-gray-300">
                    {isEn ? labelEn : label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Qualitative questions step */}
        {isQualitativeStep && qualitativeQuestions && (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {questionLabel(TOTAL_STEPS, TOTAL_STEPS)}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8">
              {dict.team.qualitativeTitle}
            </h2>
            <div className="flex flex-col gap-6 w-full max-w-lg">
              {qualitativeQuestions.map((qText, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {qText}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t.freetextPlaceholder}
                    value={qualitativeAnswers[i] || ""}
                    onChange={(e) => setQualitativeAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-8 rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {submitting ? "..." : t.submitButton}
            </button>
          </>
        )}

        {/* Loading state during auto-submit (no qualitative, last scale answered) */}
        {!hasQualitative && step >= SCALE_QUESTIONS.length && !completed && submitting && (
          <div className="flex flex-col items-center">
            <div className="text-gray-400">...</div>
          </div>
        )}

        {/* Back button */}
        {step > 0 && (
          <button
            onClick={handleBack}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            &larr; {t.backButton}
          </button>
        )}
      </div>
    </div>
  );
}
