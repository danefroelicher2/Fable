// src/lib/accountSwitcher.ts
import { supabase } from "./supabase";
import { getStoredAccounts, storeSessionForAccount } from "./accountManager";

// Type for stored refresh tokens
interface StoredToken {
  accountId: string;
  refreshToken: string;
  lastUpdated: number;
}

/**
 * Store a refresh token for an account
 */
export function storeRefreshToken(
  accountId: string,
  refreshToken: string
): void {
  if (typeof window === "undefined") return;

  try {
    // Get existing tokens
    const tokensJson = localStorage.getItem("account_refresh_tokens");
    const tokens: StoredToken[] = tokensJson ? JSON.parse(tokensJson) : [];

    // Find if this account already has a token
    const existingIndex = tokens.findIndex((t) => t.accountId === accountId);

    if (existingIndex >= 0) {
      // Update existing token
      tokens[existingIndex] = {
        accountId,
        refreshToken,
        lastUpdated: Date.now(),
      };
    } else {
      // Add new token
      tokens.push({
        accountId,
        refreshToken,
        lastUpdated: Date.now(),
      });
    }

    // Save back to localStorage
    localStorage.setItem("account_refresh_tokens", JSON.stringify(tokens));
    console.log(`Refresh token stored for account: ${accountId}`);
  } catch (error) {
    console.error("Error storing refresh token:", error);
  }
}

/**
 * Get the refresh token for an account
 */
export function getRefreshToken(accountId: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    const tokensJson = localStorage.getItem("account_refresh_tokens");
    if (!tokensJson) return null;

    const tokens: StoredToken[] = JSON.parse(tokensJson);
    const token = tokens.find((t) => t.accountId === accountId);

    if (!token) {
      console.log(`No refresh token found for account: ${accountId}`);
      return null;
    }

    console.log(`Found refresh token for account: ${accountId}`);
    return token.refreshToken;
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
}

/**
 * Initialize account switching by checking localStorage
 * This should be called on app initialization
 */
export async function initializeAccountSwitching(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // Check if we have a pending account switch
    const targetAccountId = localStorage.getItem("switchToAccountId");
    if (!targetAccountId) return false;

    console.log(`Attempting to switch to account: ${targetAccountId}`);

    // Clear the flag immediately to prevent loops
    localStorage.removeItem("switchToAccountId");

    // Get the refresh token
    const refreshToken = getRefreshToken(targetAccountId);
    if (!refreshToken) {
      console.warn("No refresh token found for account switch");
      // Instead of failing, try to fall back to stored session data
      const accounts = getStoredAccounts();
      const targetAccount = accounts.find((acc) => acc.id === targetAccountId);

      if (targetAccount) {
        console.log(
          "Account found but no refresh token available. User will need to sign in manually."
        );
        // Set a flag to prompt the user to sign in with this account
        localStorage.setItem("pendingAccountSwitch", targetAccountId);
        return false;
      }
      return false;
    }

    // Try to sign in with the refresh token
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Error switching account with refresh token:", error);
      localStorage.setItem("pendingAccountSwitch", targetAccountId);
      return false;
    }

    // Store the new refresh token
    if (data?.session?.refresh_token) {
      storeRefreshToken(targetAccountId, data.session.refresh_token);

      // Also store session data
      storeSessionForAccount(targetAccountId, {
        session: data.session,
        timestamp: Date.now(),
      });
    }

    console.log("Successfully switched to account:", targetAccountId);
    return true;
  } catch (error) {
    console.error("Error in account switching initialization:", error);
    return false;
  }
}

/**
 * Capture the refresh token when a user signs in
 * This should be called after successful authentication
 */
export async function captureAuthSession(userId: string): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();

    if (data?.session?.refresh_token) {
      console.log(`Capturing refresh token for user: ${userId}`);
      storeRefreshToken(userId, data.session.refresh_token);

      // Also store session data
      storeSessionForAccount(userId, {
        session: data.session,
        timestamp: Date.now(),
      });
    } else {
      console.warn("No refresh token available to capture");
    }
  } catch (error) {
    console.error("Error capturing auth session:", error);
  }
}

/**
 * Switch to a different account
 * @param targetAccountId The account ID to switch to
 * @returns A promise that resolves to true if switching was successful
 */
export async function switchToAccount(
  targetAccountId: string
): Promise<boolean> {
  try {
    // Check if we already have a refresh token for this account
    const refreshToken = getRefreshToken(targetAccountId);

    if (!refreshToken) {
      console.warn(
        `No refresh token available for account ${targetAccountId}. Redirecting to sign in.`
      );
      // Store the target account ID so we know where to return after signing in
      localStorage.setItem("switchToAccountId", targetAccountId);
      return false;
    }

    // First sign out of the current account
    await supabase.auth.signOut();

    // Then try to use the refresh token to sign in
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Error switching account:", error);
      // Store the target account ID for retry
      localStorage.setItem("switchToAccountId", targetAccountId);
      return false;
    }

    // Update the refresh token if we got a new one
    if (data?.session?.refresh_token) {
      storeRefreshToken(targetAccountId, data.session.refresh_token);
    }

    console.log(`Successfully switched to account: ${targetAccountId}`);
    return true;
  } catch (error) {
    console.error("Error switching accounts:", error);
    return false;
  }
}
