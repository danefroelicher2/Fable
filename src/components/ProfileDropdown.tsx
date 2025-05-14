// src/components/ProfileDropdown.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import SignInModal from "./SignInModal";
import {
  getStoredAccounts,
  storeAccount,
  updateLastUsed,
} from "@/lib/accountManager";
import { switchToAccount } from "@/lib/accountSwitcher";

export default function ProfileDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [storedAccounts, setStoredAccounts] = useState<any[]>([]);
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user profile data and stored accounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("avatar_url, username, full_name")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setProfileData(data);

          // Store this account when it's loaded
          storeAccount({
            id: user.id,
            email: user.email!,
            username: data.username,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
          });
        }

        // Load stored accounts
        loadStoredAccounts();
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [user]);

  // Load stored accounts
  const loadStoredAccounts = () => {
    try {
      const accounts = getStoredAccounts();
      // Sort accounts by last used (most recent first)
      accounts.sort((a, b) => b.last_used - a.last_used);
      setStoredAccounts(accounts);
    } catch (error) {
      console.error("Error loading stored accounts:", error);
    }
  };

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check for pending account switches that need sign-in
  useEffect(() => {
    const pendingAccountId = localStorage.getItem("pendingAccountSwitch");
    if (pendingAccountId) {
      // Clear the flag to prevent repeated prompts
      localStorage.removeItem("pendingAccountSwitch");

      // Find the account in stored accounts
      const accounts = getStoredAccounts();
      const account = accounts.find((a) => a.id === pendingAccountId);

      if (account) {
        // Show a confirmation dialog
        const shouldSwitch = window.confirm(
          `Would you like to sign in as ${account.username || account.email}?`
        );
        if (shouldSwitch) {
          // Open sign-in modal with pre-filled email
          setIsSignInModalOpen(true);
          // Pass the account email to the modal (we'll update SignInModal later)
          localStorage.setItem("prefillEmail", account.email);
        }
      }
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsDropdownOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      // Refresh the stored accounts list when opening the dropdown
      loadStoredAccounts();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAddAccount = () => {
    setIsSignInModalOpen(true);
    setIsDropdownOpen(false); // Close dropdown when opening modal
  };

  const handleSwitchToAccount = async (accountId: string) => {
    if (accountId === user?.id) return; // Already using this account

    try {
      // Update UI state
      setSwitchingAccount(true);
      setIsDropdownOpen(false);

      // Update last used time for the account we're switching to
      updateLastUsed(accountId);

      // Use our new switchToAccount function
      const success = await switchToAccount(accountId);

      if (success) {
        // Successful switch - page will refresh from the auth context
        console.log("Account switch successful");
      } else {
        // Failed to switch directly - redirect to sign in
        console.log("Redirecting to sign in for account switch");
        router.push(`/signin?accountSwitch=${accountId}`);
      }
    } catch (error) {
      console.error("Error initiating account switch:", error);
      alert("Failed to switch accounts. Please try signing in manually.");
    } finally {
      setSwitchingAccount(false);
    }
  };

  if (!user) {
    return null;
  }

  // Safely get username, preferring the database username
  const username = profileData?.username || user.email?.split("@")[0] || "";

  // Get display username with @ prefix
  const displayUsername = username ? `@${username}` : "@user";

  // Get avatar initial from username or email
  const avatarInitial = username
    ? username.charAt(0).toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown menu - Positioned ABOVE the button when open */}
        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-black rounded-xl shadow-lg py-2 z-50 border border-gray-800 min-w-[250px]">
            {/* Show stored accounts */}
            <div className="px-4 py-2 border-b border-gray-800">
              <p className="text-xs text-gray-400 mb-2">Accounts</p>

              {storedAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleSwitchToAccount(account.id)}
                  disabled={switchingAccount}
                  className={`flex items-center w-full text-left px-2 py-2 rounded-md text-sm ${
                    account.id === user.id
                      ? "bg-gray-800 text-white"
                      : "text-white hover:bg-gray-800"
                  } mb-1 ${switchingAccount ? "opacity-50 cursor-wait" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-gray-300 font-medium mr-3">
                    {account.avatar_url ? (
                      <img
                        src={account.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>
                        {account.username
                          ? account.username.charAt(0).toUpperCase()
                          : account.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    {/* Show @username instead of name/email */}
                    <div className="font-medium">
                      {account.username
                        ? `@${account.username}`
                        : account.email}
                    </div>
                  </div>

                  {account.id === user.id && (
                    <div className="ml-auto">
                      <span className="bg-blue-600 rounded-full w-2 h-2 block"></span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Option to add an existing account */}
            <button
              onClick={handleAddAccount}
              disabled={switchingAccount}
              className={`flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 ${
                switchingAccount ? "opacity-50 cursor-wait" : ""
              }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add an existing account
            </button>

            {/* Sign out option */}
            <button
              onClick={handleSignOut}
              disabled={switchingAccount}
              className={`flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 ${
                switchingAccount ? "opacity-50 cursor-wait" : ""
              }`}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Log out {displayUsername}
            </button>
          </div>
        )}

        {/* Profile button */}
        <button
          onClick={toggleDropdown}
          disabled={switchingAccount}
          className={`flex items-center w-full text-sm font-medium text-white hover:bg-gray-800 rounded-full transition-colors p-2 ${
            switchingAccount ? "opacity-50 cursor-wait" : ""
          }`}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-gray-300 font-medium mr-3">
              {profileData?.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{avatarInitial}</span>
              )}
            </div>
            <div className="flex-1 text-left mr-2">
              {/* Show only the @username instead of name and email */}
              <div className="font-medium text-white">
                {switchingAccount ? "Switching..." : displayUsername}
              </div>
            </div>
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </button>
      </div>

      {/* Sign In Modal - Updated z-index and overlay */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </>
  );
}
