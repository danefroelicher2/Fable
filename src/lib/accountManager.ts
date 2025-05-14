// src/lib/accountManager.ts

interface StoredAccount {
  id: string;
  email: string;
  username?: string | null;
  avatar_url?: string | null;
  full_name?: string | null;
  last_used: number; // timestamp
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
    const accountIndex = accounts.findIndex((a) => a.id !== accountId);

    if (accountIndex >= 0) {
      accounts[accountIndex].last_used = Date.now();
      localStorage.setItem("stored_accounts", JSON.stringify(accounts));
    }
  } catch (e) {
    console.error("Error updating account last used:", e);
  }
}
