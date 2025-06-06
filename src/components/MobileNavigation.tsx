// src/components/MobileNavigation.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationBadge from '@/components/NotificationBadge';
import MessageBadge from '@/components/MessageBadge';

export default function MobileNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthRequiredNavigation = (path: string) => {
    if (!user) {
      router.push(`/signin?redirect=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  const handlePostClick = () => {
    if (!user) {
      router.push(`/signin?redirect=${encodeURIComponent('/write')}`);
      return;
    }
    router.push('/write');
  };

  // Primary navigation items (always visible)
  const primaryNavItems = [
    {
      id: 'home',
      label: 'Home',
      href: '/',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'search',
      label: 'Search',
      href: '/search',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: 'feed',
      label: 'Feed',
      href: '/feed',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h10M7 16h5" />
        </svg>
      ),
    },
    {
      id: 'post',
      label: 'Post',
      action: handlePostClick,
      icon: (
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      ),
      isSpecial: true,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: user ? `/user/${user.id}` : '/signin',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'messages',
      label: 'Messages',
      href: user ? '/messages' : null,
      action: user ? null : () => handleAuthRequiredNavigation('/messages'),
      icon: (
        <div className="relative">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div className="absolute -top-2 -right-2">
            <MessageBadge className="h-5 w-5 flex items-center justify-center" />
          </div>
        </div>
      ),
    },
    {
      id: 'more',
      label: 'More',
      action: () => setShowMoreMenu(!showMoreMenu),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      ),
    },
  ];

  // Secondary navigation items (in "More" menu)
  const secondaryNavItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      href: user ? '/notifications' : null,
      action: user ? null : () => handleAuthRequiredNavigation('/notifications'),
      icon: (
        <div className="relative">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div className="absolute -top-1 -right-1">
            <NotificationBadge className="h-4 w-4 flex items-center justify-center" />
          </div>
        </div>
      ),
    },
    {
      id: 'communities',
      label: 'Communities',
      href: '/communities',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      href: user ? '/bookmarks' : null,
      action: user ? null : () => handleAuthRequiredNavigation('/bookmarks'),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
    {
      id: 'drafts',
      label: 'Saved Drafts',
      href: user ? '/profile/drafts' : null,
      action: user ? null : () => handleAuthRequiredNavigation('/profile/drafts'),
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/profile/account-settings',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  const handleNavClick = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
    
    if (item.id === 'more') {
      return;
    }
    
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setShowMoreMenu(false)} />
      )}

      {/* More Menu */}
      {showMoreMenu && (
        <div 
          ref={moreMenuRef}
          className="fixed bottom-20 right-4 left-4 bg-white rounded-lg shadow-xl border z-50 max-h-80 overflow-y-auto"
        >
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
              More Options
            </div>
            {secondaryNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  item.href && isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - FULL WIDTH SPREAD */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-pb">
        <div className="flex justify-between items-center px-3 py-2">
          {primaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                item.href && isActive(item.href)
                  ? 'text-red-600'
                  : item.id === 'more' && showMoreMenu
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:text-gray-800'
              } ${item.isSpecial ? 'scale-110' : ''}`}
              style={{ 
                minWidth: '48px',
                minHeight: '56px'
              }}
            >
              <span className="mb-1">
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${item.isSpecial ? 'text-red-600' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Safe area padding for content */}
      <div className="h-20" />
    </>
  );
}