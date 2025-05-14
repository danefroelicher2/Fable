// src/lib/debugUtils.ts
/**
 * Debug utility for troubleshooting account switching
 * You can call this function in the browser console:
 * import { debugAccountSwitching } from '@/lib/debugUtils'
 * debugAccountSwitching()
 */
export function debugAccountSwitching(): Record<string, any> {
  try {
    // Check for stored accounts
    const storedAccountsStr = localStorage.getItem("stored_accounts");
    const storedAccounts = storedAccountsStr
      ? JSON.parse(storedAccountsStr)
      : [];
    console.log("Stored accounts:", storedAccounts);

    // Check for refresh tokens
    const tokensStr = localStorage.getItem("account_refresh_tokens");
    const tokens = tokensStr ? JSON.parse(tokensStr) : [];
    console.log("Stored refresh tokens:", tokens);

    // Check for any pending account switches
    const pendingSwitch = localStorage.getItem("switchToAccountId");
    if (pendingSwitch) {
      console.log("Pending account switch to:", pendingSwitch);
    }

    // Compare accounts and tokens
    if (storedAccounts.length > 0 && tokens.length > 0) {
      console.log("Account coverage analysis:");

      for (const account of storedAccounts) {
        const hasToken = tokens.some((t) => t.accountId === account.id);
        console.log(
          `- Account ${account.id} (${account.email}): ${
            hasToken ? "Has token" : "No token"
          }`
        );
      }
    }

    return {
      success: true,
      accounts: storedAccounts.length,
      accountsList: storedAccounts,
      tokens: tokens.length,
      tokensList: tokens,
      pendingSwitch: pendingSwitch || null,
    };
  } catch (error) {
    console.error("Error analyzing account switching data:", error);
    return { success: false, error };
  }
}

/**
 * Clears all stored account data - use with caution
 */
export function clearAllAccountData(): boolean {
  try {
    localStorage.removeItem("stored_accounts");
    localStorage.removeItem("account_refresh_tokens");
    localStorage.removeItem("switchToAccountId");
    localStorage.removeItem("pendingAccountSwitch");
    localStorage.removeItem("prefillEmail");
    console.log("All account data cleared");
    return true;
  } catch (error) {
    console.error("Error clearing account data:", error);
    return false;
  }
}

/**
 * Debug the current session info
 */
export async function debugCurrentSession(): Promise<Record<string, any>> {
  try {
    // This function should be imported from a separate module that imports Supabase
    // You can copy this code into the browser console if needed
    const { supabase } = await import("@/lib/supabase");
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return { success: false, error };
    }

    if (!data?.session) {
      console.log("No active session found");
      return { success: true, hasSession: false };
    }

    // Sanitize the session data to avoid sensitive info in logs
    const safeSessionData = {
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        role: data.session.user.role,
        aud: data.session.user.aud,
        created_at: data.session.user.created_at,
      },
      expires_at: data.session.expires_at,
      has_refresh_token: !!data.session.refresh_token,
    };

    console.log("Current session:", safeSessionData);
    return {
      success: true,
      hasSession: true,
      sessionData: safeSessionData,
    };
  } catch (error) {
    console.error("Error debugging current session:", error);
    return { success: false, error };
  }
}
