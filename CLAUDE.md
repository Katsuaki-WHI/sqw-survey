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

## WHIエンゲージメント × Gallup Q12 検証結果

WHI定義のエンゲージメント（3問）とGallup Q12（12問）の相関を
117,308人・7,097チームのデータで検証済み。
この結果は現在地マップ（エンゲージメント座標）の科学的根拠。

### WHIエンゲージメントの定義
- 縦軸（方向性）= Q02「チームの一員に誇りを感じているか」
- 横軸（貢献意欲）= (Q13「得意なこと」+ Q19「協力し合う」) / 2
- WHIエンゲージメントスコア = (Q02 + Q13 + Q19) / 3

### 検証結果
- 個人レベル相関: r=0.851 (N=117,308人)
- チームレベル相関: r=0.894 (N=7,097チーム)
- R²=0.799 → 3問でQ12(12問)の情報の80%を説明
- Q40(幸福度)予測力: WHI r=0.875 > Q12 r=0.831（WHIが上回る）
- Gallup 3分類(Engaged/Not Engaged/Actively Disengaged)との一致率: 77.6%
- 極端な誤分類(Engaged↔Disengaged): ほぼゼロ(0.1-0.4%)

### 結論
WHI定義のエンゲージメントはGallup Q12と強い相関(r=0.89)を示し、
わずか3問で世界標準の12問指標に匹敵する測定精度を実現。
幸福度予測力ではQ12を上回る(効率4倍)。

### 関連ファイル
- 現在地マップ: `src/components/survey/EngagementMap.tsx`
- 軸の計算: Q02(id:2), Q13(id:13), Q19(id:19)
- データソース: `data/selectAnswersForAncate01 (加工後).csv`
