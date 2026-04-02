"use client";

import { useState } from "react";
import { QUESTIONS, SCALE_LABELS } from "@/lib/survey/questions";
import {
  calcTeamAverage,
  calcWagonSpeed,
} from "@/lib/survey/scoring";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import LanguageToggle from "@/components/LanguageToggle";

export type Answers = Record<number, number | string>;

const SCALE_QUESTIONS = QUESTIONS.filter((q) => q.type === "scale");
const FREETEXT_QUESTIONS = QUESTIONS.filter((q) => q.type === "freetext");
const TOTAL_STEPS = SCALE_QUESTIONS.length + 1;

interface SurveyFlowProps {
  /** Called with answers when survey is submitted. Return a URL to redirect to, or void to show inline results. */
  onSubmit?: (answers: Answers) => Promise<string | void>;
  /** URL to navigate after completion (instead of inline results) */
  completedRedirect?: string;
}

export default function SurveyFlow({ onSubmit }: SurveyFlowProps) {
  const { locale, dict } = useLocale();
  const t = dict.survey;
  const isEn = locale === "en";

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isFreetextStep = step === SCALE_QUESTIONS.length;
  const currentQuestion = !isFreetextStep ? SCALE_QUESTIONS[step] : null;
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  function handleScaleAnswer(value: number) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  }

  function handleFreetextChange(questionId: number, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (onSubmit) {
        const redirect = await onSubmit(answers);
        if (redirect) {
          window.location.href = redirect;
          return;
        }
      }
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function questionLabel(current: number, total: number) {
    return t.questionOf
      .replace("{current}", String(current))
      .replace("{total}", String(total));
  }

  if (completed) {
    const scaleAnswers: Record<number, number> = {};
    for (const [key, val] of Object.entries(answers)) {
      if (typeof val === "number") {
        scaleAnswers[Number(key)] = val;
      }
    }
    const teamAvg = calcTeamAverage(scaleAnswers);
    const speed = calcWagonSpeed(teamAvg);

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-black">
        <LanguageToggle />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t.completedTitle}
        </h1>
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t.wagonForce}
          </p>
          <p className="text-5xl font-bold text-blue-600 mt-2">
            {speed}{" "}
            <span className="text-2xl">{t.unit}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t.teamAvgLabel}: {teamAvg} / 5.00
          </p>
        </div>
        <Link
          href={`/${locale}`}
          className="mt-8 rounded-full bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 transition-colors"
        >
          {t.backToTop}
        </Link>
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

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        {/* Scale questions */}
        {!isFreetextStep && currentQuestion && (
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

        {/* Free text */}
        {isFreetextStep && (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {questionLabel(TOTAL_STEPS, TOTAL_STEPS)}
              {t.freetextLabel}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8">
              {t.freetextTitle}
            </h2>
            <div className="flex flex-col gap-6 w-full max-w-lg">
              {FREETEXT_QUESTIONS.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isEn ? q.textEn : q.text}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t.freetextPlaceholder}
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) =>
                      handleFreetextChange(q.id, e.target.value)
                    }
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
