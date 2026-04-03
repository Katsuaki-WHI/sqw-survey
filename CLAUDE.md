@AGENTS.md

## コメントシステムの10段階拡張手順

コメントデータは `src/lib/survey/comments.ts` で管理されています。
現在は5段階（excellent/good/average/poor/critical）ですが、
以下の手順で10段階に拡張できます。

### 手順

1. `src/lib/survey/comments.ts` の `ScaleLevel` 型に新レベルを追加:
   ```ts
   export type ScaleLevel =
     | "exceptional" | "excellent" | "very_good" | "good" | "above_average"
     | "average" | "below_average" | "poor" | "very_poor" | "critical";
   ```

2. `COMMENTS` オブジェクトの各カテゴリに新レベルのコメントを追加

3. `src/lib/survey/scoring.ts` の `getScaleLevel()` 関数の閾値を10段階に変更

4. 関連コンポーネントの色分け・ラベルを10段階に対応
   - `ResultsView.tsx` の `levelBarColor()`
   - `WagonIllustration.tsx` の `scoreToLevel()`
   - `WagonComposite.tsx` の `scoreToStage()`

### ファイル構造
- コメントデータ: `src/lib/survey/comments.ts`
- スコアリング: `src/lib/survey/scoring.ts`
- 結果表示: `src/components/survey/ResultsView.tsx`
