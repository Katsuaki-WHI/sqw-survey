import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          SQWサーベイ
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
          スクエアホイールサーベイで、あなたのチームの状態を可視化しましょう。
          約5分で完了します。
        </p>
        <Link
          href="/survey"
          className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          サーベイを始める
        </Link>
      </main>
      <footer className="w-full py-6 text-center text-sm text-gray-400">
        &copy; Work Happiness
      </footer>
    </div>
  );
}
