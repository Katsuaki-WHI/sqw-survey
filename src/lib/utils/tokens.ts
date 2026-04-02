import { randomBytes } from "crypto";

/** 招待URL用の短いコード (8文字) */
export function generateInviteCode(): string {
  return randomBytes(6).toString("base64url").slice(0, 8);
}

/** 管理者アクセス用トークン (32文字) */
export function generateAdminToken(): string {
  return randomBytes(24).toString("base64url");
}

/** メンバー識別用トークン (24文字) */
export function generateMemberToken(): string {
  return randomBytes(18).toString("base64url");
}
