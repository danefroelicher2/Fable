interface StoredAccount {
  id: string;
  email: string;
  username?: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
  last_used: number; // timestamp
  session_data?: string; // store auth session data
}

// Get all stored accounts
export function getStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const accounts = localStorage.getItem("stored_accounts");
    return accounts ? JSON.parse(accounts) : [];
  } catch (e) {
    console.error("Error getting stored accounts:", e);
    return [];
  }
}

// Store session data for an account
export function storeSessionForAccount(
  accountId: string,
  sessionData: any
): void {
  if (typeof window === "undefined") return;

  try {
    const accounts = getStoredAccounts();
    const accountIndex = accounts.findIndex((a) => a.id === accountId);

    if (accountIndex >= 0) {
      accounts[accountIndex].session_data = JSON.stringify(sessionData);
      localStorage.setItem("stored_accounts", JSON.stringify(accounts));
    }
  } catch (e) {
    console.error("Error storing session data:", e);
  }
}

// Get session data for an account
export function getSessionForAccount(accountId: string): any {
  if (typeof window === "undefined") return null;

  try {
    const accounts = getStoredAccounts();
    const account = accounts.find((a) => a.id === accountId);

    if (account && account.session_data) {
      return JSON.parse(account.session_data);
    }
    return null;
  } catch (e) {
    console.error("Error getting session data:", e);
    return null;
  }
}

// Add or update an account
export function storeAccount(account: Omit<StoredAccount, "last_used">): void {
  if (typeof window === "undefined") return;

  try {
    const accounts = getStoredAccounts();
    const existingIndex = accounts.findIndex((a) => a.id === account.id);

    const updatedAccount = {
      ...account,
      last_used: Date.now(),
    };

    if (existingIndex >= 0) {
      // Preserve existing session data if we're updating an account
      if (accounts[existingIndex].session_data) {
        updatedAccount.session_data = accounts[existingIndex].session_data;
      }
      accounts[existingIndex] = updatedAccount;
    } else {
      accounts.push(updatedAccount);
    }

    localStorage.setItem("stored_accounts", JSON.stringify(accounts));
  } catch (e) {
    console.error("Error storing account:", e);
  }
}

// Remove an account
export function removeAccount(accountId: string): void {
  if (typeof window === "undefined") return;

  try {
    const accounts = getStoredAccounts();
    const filteredAccounts = accounts.filter((a) => a.id !== accountId);
    localStorage.setItem("stored_accounts", JSON.stringify(filteredAccounts));
  } catch (e) {
    console.error("Error removing account:", e);
  }
}

// Update last used timestamp for an account
export function updateLastUsed(accountId: string): void {
  if (typeof window === "undefined") return;

  try {
    const accounts = getStoredAccounts();
    const accountIndex = accounts.findIndex((a) => a.id === accountId);

    if (accountIndex >= 0) {
      accounts[accountIndex].last_used = Date.now();
      localStorage.setItem("stored_accounts", JSON.stringify(accounts));
    }
  } catch (e) {
    console.error("Error updating account last used:", e);
  }
}
