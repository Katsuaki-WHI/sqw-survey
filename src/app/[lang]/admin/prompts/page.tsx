"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";
import LanguageToggle from "@/components/LanguageToggle";

interface PromptRecord {
  id: string;
  type: string;
  language: string;
  content: string;
  version: number;
  is_active: boolean;
  updated_at: string;
}

const TABS = [
  { type: "personal", language: "ja", label: "個人レポート（日本語）", labelEn: "Personal Report (JA)" },
  { type: "personal", language: "en", label: "個人レポート（英語）", labelEn: "Personal Report (EN)" },
  { type: "team", language: "ja", label: "チームレポート（日本語）", labelEn: "Team Report (JA)" },
  { type: "team", language: "en", label: "チームレポート（英語）", labelEn: "Team Report (EN)" },
];

export default function PromptsPage() {
  const { locale } = useLocale();
  const isEn = locale === "en";
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState("");
  const [history, setHistory] = useState<PromptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState("");
  const [toast, setToast] = useState("");

  const tab = TABS[activeTab];

  const loadPrompt = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/ai-prompts?type=${tab.type}&language=${tab.language}`);
    const data = await res.json();
    if (data.active) setContent(data.active.content);
    else setContent("");
    setHistory(data.history || []);
    setLoading(false);
  }, [tab.type, tab.language]);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/ai-prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: tab.type, language: tab.language, content }),
    });
    setToast(isEn ? "Saved!" : "保存しました！");
    setTimeout(() => setToast(""), 3000);
    await loadPrompt();
    setSaving(false);
  }

  async function handleRestore(version: number) {
    const record = history.find((h) => h.version === version);
    if (!record) return;
    setContent(record.content);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult("");
    const res = await fetch("/api/ai-report/personal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true, type: tab.type, language: tab.language }),
    });
    const data = await res.json();
    setTestResult(data.report || data.message || "No result");
    setTesting(false);
  }

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <LanguageToggle />
      <div className="max-w-4xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {isEn ? "Prompt Management" : "プロンプト管理"}
        </h1>

        {toast && (
          <div className="fixed top-16 right-4 z-50 rounded-lg bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm rounded-t-lg whitespace-nowrap ${
                activeTab === i
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {isEn ? t.labelEn : t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-400">...</div>
        ) : (
          <>
            {/* Editor */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {saving ? "..." : isEn ? "Save" : "保存する"}
              </button>
              <button
                onClick={handleTest}
                disabled={testing}
                className="rounded-lg border border-gray-300 dark:border-gray-600 px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                {testing ? "..." : isEn ? "Test Generate" : "テスト生成"}
              </button>
            </div>

            {/* Test result */}
            {testResult && (
              <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {isEn ? "Test Result" : "テスト結果"}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{testResult}</div>
              </div>
            )}

            {/* Version history */}
            {history.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  {isEn ? "Version History" : "バージョン履歴"}
                </h3>
                <div className="flex flex-col gap-2">
                  {history.slice(0, 5).map((h) => (
                    <div key={h.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2">
                      <div>
                        <span className="text-sm text-gray-900 dark:text-white">v{h.version}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(h.updated_at).toLocaleString(isEn ? "en-US" : "ja-JP")}
                        </span>
                        {h.is_active && <span className="text-xs text-green-600 ml-2">{isEn ? "(active)" : "(有効)"}</span>}
                      </div>
                      {!h.is_active && (
                        <button
                          onClick={() => handleRestore(h.version)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {isEn ? "Restore" : "このバージョンに戻す"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
