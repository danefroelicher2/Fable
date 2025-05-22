// src/lib/adminUtils.ts
export const ADMIN_USER_ID = "3b398d8a-11de-4066-a7d6-091c21647ecb";

export function isAdmin(userId: string | undefined): boolean {
  return userId === ADMIN_USER_ID;
}
