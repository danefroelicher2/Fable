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
  getSessionForAccount,
  storeSessionForAccount,
} from "@/lib/accountManager";

export default function ProfileDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [storedAccounts, setStoredAccounts] = useState<any[]>([]);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
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

          // Store the current session data
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            storeSessionForAccount(user.id, sessionData.session);
          }
        }

        // Load stored accounts
        const accounts = getStoredAccounts();
        setStoredAccounts(accounts);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [user]);

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
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAddAccount = () => {
    setIsSignInModalOpen(true);
    setIsDropdownOpen(false); // Close dropdown when opening modal
  };

  const switchToAccount = async (accountId: string) => {
    if (accountId === user?.id) return; // Already using this account

    setIsSwitchingAccount(true);
    try {
      // Get stored session for this account
      const sessionData = getSessionForAccount(accountId);

      // If we have a stored session, try to use it
      if (sessionData) {
        try {
          // First sign out current user
          await supabase.auth.signOut();

          // Try to set the session from stored data
          const { error } = await supabase.auth.setSession(sessionData);

          if (!error) {
            // Success! Session was still valid
            updateLastUsed(accountId);
            setIsDropdownOpen(false);

            // Refresh the page to update UI with the new user
            window.location.reload();
            return;
          }
          // If error (session expired), continue to sign-in flow
          console.log("Stored session expired, redirecting to sign in");
        } catch (err) {
          console.error("Error using stored session:", err);
          // Continue to sign-in flow if session reuse fails
        }
      }

      // If no session data or session expired, redirect to sign-in
      await supabase.auth.signOut();
      updateLastUsed(accountId);

      // Get account info to pre-fill sign-in form
      const account = storedAccounts.find((a) => a.id === accountId);

      // Redirect to sign-in page with account info
      if (account) {
        localStorage.setItem("switch_to_account", account.email);
        router.push(`/signin?accountSwitch=${accountId}`);
      }
    } catch (error) {
      console.error("Error switching accounts:", error);
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  if (!user) {
    return null;
  }

  // Safely get the email address, handling potential undefined
  const userEmail = user?.email || "";

  // Safely truncate email if needed
  const displayEmail =
    userEmail.length > 16 ? `${userEmail.substring(0, 16)}...` : userEmail;

  // Safely get the first character of the email
  const avatarInitial =
    userEmail.length > 0 ? userEmail.charAt(0).toUpperCase() : "U";

  // Get display name - prefer full name, then username
  const displayName =
    profileData?.full_name || profileData?.username || "Account";

  // Get username for logout display
  const username = profileData?.username || userEmail.split("@")[0];

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown menu - Positioned ABOVE the button when open */}
        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-200 min-w-[250px]">
            {/* Show stored accounts */}
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Accounts</p>

              {storedAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => switchToAccount(account.id)}
                  disabled={isSwitchingAccount}
                  className={`flex items-center w-full text-left px-2 py-2 rounded-md text-sm ${
                    account.id === user.id
                      ? "bg-gray-100 text-black"
                      : "text-gray-800 hover:bg-gray-100"
                  } mb-1 ${isSwitchingAccount ? "opacity-50 cursor-wait" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-600 font-medium mr-3">
                    {account.avatar_url ? (
                      <img
                        src={account.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{account.email.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {account.full_name || account.username || "Account"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {account.email}
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
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
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
              className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
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
              Log out @{username}
            </button>
          </div>
        )}

        {/* Profile button */}
        <button
          onClick={toggleDropdown}
          disabled={isSwitchingAccount}
          className={`flex items-center w-full text-sm font-medium text-gray-800 hover:bg-gray-100 rounded-full transition-colors p-2 ${
            isSwitchingAccount ? "opacity-50 cursor-wait" : ""
          }`}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-600 font-medium mr-3">
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
              <div className="font-medium text-gray-800">{displayName}</div>
              <div className="text-xs text-gray-500 truncate">
                {displayEmail}
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
