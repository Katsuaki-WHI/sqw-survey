"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "SQW Survey <onboarding@resend.dev>";

interface TeamCreatedEmailParams {
  to: string;
  teamName: string;
  adminUrl: string;
  inviteUrl: string;
  deadline: string | null;
  locale: string;
}

export async function sendTeamCreatedEmail({
  to,
  teamName,
  adminUrl,
  inviteUrl,
  deadline,
  locale,
}: TeamCreatedEmailParams) {
  const isEn = locale === "en";

  const subject = isEn
    ? `[SQW Survey 2] Team "${teamName}" has been created`
    : `【SQWサーベイ2】チーム「${teamName}」を作成しました`;

  const deadlineText = deadline
    ? (isEn ? `Deadline: ${deadline}` : `回答期限: ${deadline}`)
    : (isEn ? "Deadline: None" : "回答期限: なし");

  const html = isEn
    ? `
<h2>Team "${teamName}" has been created</h2>
<p>Your team survey is ready. Share the invite link with your team members.</p>

<h3>Organizer URL (keep this safe!)</h3>
<p><a href="${adminUrl}">${adminUrl}</a></p>
<p style="color:#dc2626;font-size:13px;">* This link cannot be displayed again. Make sure to save it.</p>

<h3>Invite URL (share with members)</h3>
<p><a href="${inviteUrl}">${inviteUrl}</a></p>

<p>${deadlineText}</p>

<hr/>
<p style="color:#9ca3af;font-size:12px;">SQW Survey - Work Happiness Inc.</p>
`
    : `
<h2>チーム「${teamName}」を作成しました</h2>
<p>チームサーベイの準備ができました。招待リンクをメンバーに共有してください。</p>

<h3>設定者URL（大切に保管してください）</h3>
<p><a href="${adminUrl}">${adminUrl}</a></p>
<p style="color:#dc2626;font-size:13px;">※このリンクは再表示できません。必ず保管してください。</p>

<h3>招待リンク（メンバーに共有）</h3>
<p><a href="${inviteUrl}">${inviteUrl}</a></p>

<p>${deadlineText}</p>

<hr/>
<p style="color:#9ca3af;font-size:12px;">SQWサーベイ - Work Happiness Inc.</p>
`;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { success: true };
  } catch (error) {
    console.error("Failed to send team created email:", error);
    return { error: "Failed to send email" };
  }
}

interface ResultsPublishedEmailParams {
  to: string[];
  teamName: string;
  inviteUrl: string;
  locale: string;
}

export async function sendResultsPublishedEmail({
  to,
  teamName,
  inviteUrl,
  locale,
}: ResultsPublishedEmailParams) {
  if (to.length === 0) return { success: true };

  const isEn = locale === "en";

  const subject = isEn
    ? `[SQW Survey 2] Team results for "${teamName}" are now available`
    : `【SQWサーベイ2】「${teamName}」のチーム結果が公開されました`;

  const resultsUrl = `${inviteUrl}/results`;

  const html = isEn
    ? `
<h2>Team results for "${teamName}" are now available</h2>
<p>Your team's survey results have been published. View them below:</p>

<p><a href="${resultsUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">View Team Results</a></p>

<p style="font-size:13px;color:#6b7280;">Or visit: <a href="${resultsUrl}">${resultsUrl}</a></p>

<hr/>
<p style="color:#9ca3af;font-size:12px;">SQW Survey - Work Happiness Inc.</p>
`
    : `
<h2>「${teamName}」のチーム結果が公開されました</h2>
<p>チームのサーベイ結果が公開されました。以下から確認できます：</p>

<p><a href="${resultsUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">チーム結果を見る</a></p>

<p style="font-size:13px;color:#6b7280;">またはこちら: <a href="${resultsUrl}">${resultsUrl}</a></p>

<hr/>
<p style="color:#9ca3af;font-size:12px;">SQWサーベイ - Work Happiness Inc.</p>
`;

  try {
    // Send to each recipient individually (Resend batch)
    const promises = to.map((email) =>
      resend.emails.send({ from: FROM, to: email, subject, html })
    );
    await Promise.allSettled(promises);
    return { success: true };
  } catch (error) {
    console.error("Failed to send results published email:", error);
    return { error: "Failed to send email" };
  }
}

interface QualitativeEmailParams {
  to: string;
  teamName: string;
  responses: { questionText: string; answers: string[] }[];
  locale: string;
}

export async function sendQualitativeResponsesEmail({
  to,
  teamName,
  responses,
  locale,
}: QualitativeEmailParams) {
  const isEn = locale === "en";

  const subject = isEn
    ? `[SQW Survey 2] Open-ended responses for "${teamName}" are ready`
    : `【SQWサーベイ2】「${teamName}」の定性回答が届いています`;

  const responseHtml = responses
    .map((r) => {
      const answerList = r.answers.map((a) => `<li style="margin-bottom:8px;">${a}</li>`).join("");
      return `<h3 style="margin-top:16px;">${r.questionText}</h3><ul>${answerList}</ul>`;
    })
    .join("");

  const html = isEn
    ? `<h2>Open-ended responses for "${teamName}"</h2>${responseHtml}<hr/><p style="color:#9ca3af;font-size:12px;">SQW Survey - Work Happiness Inc.</p>`
    : `<h2>「${teamName}」の定性回答</h2>${responseHtml}<hr/><p style="color:#9ca3af;font-size:12px;">SQWサーベイ - Work Happiness Inc.</p>`;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return { success: true };
  } catch (error) {
    console.error("Failed to send qualitative email:", error);
    return { error: "Failed to send email" };
  }
}
