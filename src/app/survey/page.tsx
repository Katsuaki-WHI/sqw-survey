"use client";

import { useState } from "react";
import { QUESTIONS, SCALE_LABELS } from "@/lib/survey/questions";
import { calcCategoryScores, calcTeamAverage, calcWagonSpeed } from "@/lib/survey/scoring";
import Link from "next/link";

type Answers = Record<number, number | string>;

const SCALE_QUESTIONS = QUESTIONS.filter((q) => q.type === "scale");
const FREETEXT_QUESTIONS = QUESTIONS.filter((q) => q.type === "freetext");
const TOTAL_STEPS = SCALE_QUESTIONS.length + 1; // +1 for freetext page

export default function SurveyPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [completed, setCompleted] = useState(false);

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

  function handleSubmit() {
    // スコア計算
    const scaleAnswers: Record<number, number> = {};
    for (const [key, val] of Object.entries(answers)) {
      if (typeof val === "number") {
        scaleAnswers[Number(key)] = val;
      }
    }
    const teamAvg = calcTeamAverage(scaleAnswers);
    const speed = calcWagonSpeed(teamAvg);
    const categoryScores = calcCategoryScores(scaleAnswers);

    console.log("Results:", { teamAvg, speed, categoryScores });
    setCompleted(true);
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          回答ありがとうございました
        </h1>
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            ワゴン推進力
          </p>
          <p className="text-5xl font-bold text-blue-600 mt-2">
            {speed} <span className="text-2xl">km</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            チーム平均スコア: {teamAvg} / 5.00
          </p>
        </div>
        <Link
          href="/"
          className="mt-8 rounded-full bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 transition-colors"
        >
          トップに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      {/* プログレスバー */}
      <div className="w-full bg-gray-200 dark:bg-gray-800 h-2">
        <div
          className="bg-blue-600 h-2 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        {/* 5段階評価質問 */}
        {!isFreetextStep && currentQuestion && (
          <>
            <p className="text-sm font-medium text-blue-600 mb-2">
              {currentQuestion.wagonPart} - {currentQuestion.categoryLabel}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              質問 {step + 1} / {TOTAL_STEPS}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>
            <div className="flex flex-col gap-3 w-full max-w-md">
              {SCALE_LABELS.map(({ value, label }) => (
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
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* 自由記述 */}
        {isFreetextStep && (
          <>
            <p className="text-sm text-gray-400 mb-4">
              質問 {TOTAL_STEPS} / {TOTAL_STEPS}（自由記述）
            </p>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-8">
              自由記述
            </h2>
            <div className="flex flex-col gap-6 w-full max-w-lg">
              {FREETEXT_QUESTIONS.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {q.text}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="任意でお書きください"
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
              className="mt-8 rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              回答を送信する
            </button>
          </>
        )}

        {/* 戻るボタン */}
        {step > 0 && (
          <button
            onClick={handleBack}
            className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← 前の質問に戻る
          </button>
        )}
      </div>
    </div>
  );
}
