// src/lib/accountSwitcher.ts
import { supabase } from "./supabase";
import { getStoredAccounts } from "./accountManager";

/**
 * Store a user's session data for account switching
 */
export function storeUserSession(userId: string, session: any): void {
  if (typeof window === "undefined") return;

  try {
    // Get existing sessions
    const sessionsJson = localStorage.getItem("user_sessions");
    const sessions = sessionsJson ? JSON.parse(sessionsJson) : {};

    // Store this user's session
    sessions[userId] = {
      session: session,
      timestamp: Date.now(),
    };

    // Save back to localStorage
    localStorage.setItem("user_sessions", JSON.stringify(sessions));
    console.log(`Stored session for user ${userId}`);
  } catch (error) {
    console.error("Error storing user session:", error);
  }
}

/**
 * Get a user's stored session data
 */
export function getUserSession(userId: string): any {
  if (typeof window === "undefined") return null;

  try {
    const sessionsJson = localStorage.getItem("user_sessions");
    if (!sessionsJson) return null;

    const sessions = JSON.parse(sessionsJson);
    return sessions[userId]?.session || null;
  } catch (error) {
    console.error("Error retrieving user session:", error);
    return null;
  }
}

/**
 * Switch to another account using stored credentials
 */
export async function switchToAccount(targetUserId: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // Get the stored accounts to find the account email
    const accounts = getStoredAccounts();
    const accountToSwitch = accounts.find((acc) => acc.id === targetUserId);

    if (!accountToSwitch) {
      console.error("Account not found in stored accounts");
      return false;
    }

    // Store the target account ID in localStorage
    localStorage.setItem("switchToAccountId", targetUserId);

    // Also store which page we're on so we can return to it
    localStorage.setItem("switchAccountReturnPath", window.location.pathname);

    // Instead of refreshing the whole page, redirect to a special switch page
    window.location.href = "/auth/switch-account";

    return true;
  } catch (error) {
    console.error("Error initiating account switch:", error);
    return false;
  }
}

/**
 * Capture the current session
 */
export async function captureCurrentSession(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();

    if (data?.session && data.session.user) {
      // Store the entire session for the user
      storeUserSession(data.session.user.id, data.session);
    }
  } catch (error) {
    console.error("Error capturing current session:", error);
  }
}

/**
 * Complete the account switch by using stored credentials
 */
export async function completeAccountSwitch(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    // Check if we have a pending account switch
    const targetAccountId = localStorage.getItem("switchToAccountId");
    if (!targetAccountId) {
      console.log("No account switch pending");
      return false;
    }

    console.log(`Completing account switch to: ${targetAccountId}`);

    // Get the stored accounts to find the account credentials
    const accounts = getStoredAccounts();
    const accountToSwitch = accounts.find((acc) => acc.id === targetAccountId);

    if (!accountToSwitch) {
      console.error("Account not found in stored accounts");
      localStorage.removeItem("switchToAccountId");
      return false;
    }

    // Get the return path
    const returnPath = localStorage.getItem("switchAccountReturnPath") || "/";

    // Clear the flags immediately to prevent loops
    localStorage.removeItem("switchToAccountId");
    localStorage.removeItem("switchAccountReturnPath");

    // First sign out the current user
    await supabase.auth.signOut();

    // Then sign in as the new user using stored email
    if (!accountToSwitch.email) {
      console.error("Missing email for account switching");
      return false;
    }

    // Redirect to sign-in page with special parameters
    window.location.href = `/auth/signin?redirect=${encodeURIComponent(
      returnPath
    )}&switchEmail=${encodeURIComponent(accountToSwitch.email)}`;

    return true;
  } catch (error) {
    console.error("Error completing account switch:", error);
    // Clear any pending switches
    localStorage.removeItem("switchToAccountId");
    localStorage.removeItem("switchAccountReturnPath");
    return false;
  }
}
