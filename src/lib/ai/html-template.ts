/**
 * HTML design instructions appended to AI report prompts.
 * Instructs the AI to output styled HTML instead of Markdown.
 */

export const HTML_OUTPUT_INSTRUCTIONS_JA = `

【出力形式：HTML】
レポートは必ずHTML形式で出力してください。
外部CSSライブラリは使用せず、すべてインラインstyleで完結させること。
Google Fontsの<link>タグは含めないこと（表示側で読み込みます）。

以下のカラーパレットを使用：
--primary: #028090（ティール・ブランドカラー）
--secondary: #02C39A（ミント）
--accent: #F0A500（ゴールド・強調）
--coral: #E8614A（コーラル・課題）
--purple: #7B5EA7（紫・洞察）
--green: #3DB56C（緑・強み）
--dark: #0D2137（ダーク背景）
--text: #1E293B
--muted: #64748B

以下のHTML構造パターンを使用してください：

■ ヘッダー（ダーク背景グラデーション）：
<div style="background:linear-gradient(135deg,#0D2137,#028090);color:white;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
  <div style="font-size:12px;color:#02C39A;letter-spacing:2px;">SQWサーベイ2 個人AIレポート</div>
  <h1 style="font-size:28px;font-weight:bold;margin:12px 0;">{name}さんへ</h1>
  <div style="display:inline-block;background:#F0A500;color:#0D2137;border-radius:24px;padding:8px 24px;font-weight:bold;font-size:18px;margin-top:8px;">チームタイプ名</div>
</div>

■ セクション区切り：
<div style="display:flex;align-items:center;margin:32px 0 16px;gap:12px;">
  <div style="flex:1;height:1px;background:#E2E8F0;"></div>
  <div style="color:#028090;font-weight:bold;font-size:13px;white-space:nowrap;">アイコン セクションタイトル</div>
  <div style="flex:1;height:1px;background:#E2E8F0;"></div>
</div>

■ カード（白背景）：
<div style="background:#FFFFFF;border:1.5px solid #E2E8F0;border-radius:16px;padding:24px;margin-bottom:16px;">内容</div>

■ 強みカード（緑）：
<div style="background:#F0FFF4;border:1.5px solid #3DB56C;border-radius:12px;padding:16px;margin-bottom:12px;">
  <div style="color:#3DB56C;font-weight:bold;margin-bottom:8px;">💪 強み</div>
  <div style="font-size:14px;">内容</div>
</div>

■ 課題カード（コーラル）：
<div style="background:#FFF5F5;border:1.5px solid #E8614A;border-radius:12px;padding:16px;margin-bottom:12px;">
  <div style="color:#E8614A;font-weight:bold;margin-bottom:8px;">🌱 成長の余地</div>
  <div style="font-size:14px;">内容</div>
</div>

■ 洞察カード（紫）：
<div style="background:#F5F0FF;border:1.5px solid #7B5EA7;border-radius:12px;padding:16px;margin-bottom:12px;">
  <div style="color:#7B5EA7;font-weight:bold;margin-bottom:8px;">🔍 気づき</div>
  <div style="font-size:14px;">内容</div>
</div>

■ ギャップ強調ボックス（ゴールド）：
<div style="background:#FFFBEB;border:2px solid #F0A500;border-radius:12px;padding:20px;margin:16px 0;">
  <div style="font-size:12px;color:#64748B;">認識ギャップ</div>
  <div style="font-size:32px;font-weight:bold;color:#F0A500;">数値</div>
  <div style="font-size:14px;color:#1E293B;margin-top:8px;">説明</div>
</div>

■ アクションカード（ティール左ボーダー）：
<div style="background:#FFFFFF;border-left:4px solid #028090;border-radius:0 12px 12px 0;padding:16px;margin:12px 0;">
  <div style="font-weight:bold;color:#028090;margin-bottom:8px;">アクションタイトル</div>
  <div style="font-size:14px;color:#1E293B;">詳細</div>
</div>

■ 締めメッセージ（ダーク背景）：
<div style="background:linear-gradient(135deg,#0D2137,#028090);border-radius:16px;padding:32px;text-align:center;margin-top:32px;color:white;">
  <div style="font-size:18px;font-weight:bold;margin-bottom:8px;">メッセージ</div>
  <div style="font-size:14px;color:#02C39A;">サブメッセージ</div>
</div>

全体のfont-familyは 'Noto Sans JP', sans-serif を使用。
テキストのline-heightは1.8を基本とする。
`;

export const HTML_OUTPUT_INSTRUCTIONS_EN = `

【Output Format: HTML】
Output the report in HTML format.
Do NOT use external CSS libraries — use inline styles only.
Do NOT include Google Fonts <link> tags (loaded by the display component).

Use this color palette:
--primary: #028090 (teal, brand)
--secondary: #02C39A (mint)
--accent: #F0A500 (gold, emphasis)
--coral: #E8614A (challenges)
--purple: #7B5EA7 (insights)
--green: #3DB56C (strengths)
--dark: #0D2137 (dark backgrounds)
--text: #1E293B
--muted: #64748B

Use the same HTML structure patterns as the Japanese version:
- Dark gradient header with team type badge
- Section dividers with icon and title
- White cards with 16px border-radius
- Green cards for strengths, coral for challenges, purple for insights
- Gold-bordered gap highlight boxes
- Teal left-border action cards
- Dark gradient closing message

Use font-family: 'Noto Sans JP', sans-serif.
Use line-height: 1.8 for body text.
`;
