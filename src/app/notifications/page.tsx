// src/app/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Notification {
  id: string;
  user_id: string;
  action_type: "follow" | "like" | "comment";
  action_user_id: string;
  article_id?: string;
  comment_id?: string;
  created_at: string;
  is_read: boolean;
  // Related user data
  action_user?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  // Related article data (if applicable)
  article?: {
    title: string;
    slug: string;
  };
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If not logged in, redirect to sign in
    if (!user && !loading) {
      router.push("/signin?redirect=" + encodeURIComponent("/notifications"));
      return;
    }

    if (user) {
      fetchNotifications();
    }
  }, [user, router]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      console.log("Fetching notifications for user:", user.id);

      // First fetch all notifications
      const { data: notificationsData, error: notificationsError } = await (
        supabase as any
      )
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (notificationsError) throw notificationsError;

      if (!notificationsData || notificationsData.length === 0) {
        setNotifications([]);
        return;
      }

      console.log("Notifications fetched:", notificationsData.length);

      // Then process each notification to get the related user and article info
      const processedNotifications = await Promise.all(
        notificationsData.map(async (notification: any) => {
          // Get action user info
          let actionUser = null;
          if (notification.action_user_id) {
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("username, full_name, avatar_url")
              .eq("id", notification.action_user_id)
              .single();

            if (!userError) {
              actionUser = userData;
            }
          }

          // Get article info if applicable
          let article = null;
          if (notification.article_id) {
            const { data: articleData, error: articleError } = await (
              supabase as any
            )
              .from("public_articles")
              .select("title, slug")
              .eq("id", notification.article_id)
              .single();

            if (!articleError) {
              article = articleData;
            }
          }

          return {
            ...notification,
            action_user: actionUser,
            article: article,
          };
        })
      );

      setNotifications(processedNotifications);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      // Update the notification in the database
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      // Update the local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }

  async function markAllAsRead() {
    try {
      if (!user) return;

      // Update all notifications for the user
      const { error } = await (supabase as any)
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      // Update the local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }

  function renderNotificationContent(notification: Notification) {
    const { action_type, action_user, article } = notification;

    switch (action_type) {
      case "follow":
        return (
          <span>
            <span className="font-medium">
              {action_user?.full_name || action_user?.username || "Someone"}
            </span>{" "}
            started following you
          </span>
        );
      case "like":
        return (
          <span>
            <span className="font-medium">
              {action_user?.full_name || action_user?.username || "Someone"}
            </span>{" "}
            liked your article{" "}
            {article && (
              <Link
                href={`/articles/${article.slug}`}
                className="text-blue-600 hover:underline"
              >
                {article.title}
              </Link>
            )}
          </span>
        );
      case "comment":
        return (
          <span>
            <span className="font-medium">
              {action_user?.full_name || action_user?.username || "Someone"}
            </span>{" "}
            commented on your article{" "}
            {article && (
              <Link
                href={`/articles/${article.slug}`}
                className="text-blue-600 hover:underline"
              >
                {article.title}
              </Link>
            )}
          </span>
        );
      default:
        return <span>You have a new notification</span>;
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than a minute
    if (diff < 60 * 1000) {
      return "Just now";
    }

    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    // Otherwise, show the date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 ${!notification.is_read ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 overflow-hidden mr-3">
                      {notification.action_user?.avatar_url ? (
                        <img
                          src={notification.action_user.avatar_url}
                          alt={notification.action_user.username || "User"}
                          className="h-10 w-10 object-cover"
                        />
                      ) : (
                        <span className="text-lg">
                          {(
                            notification.action_user?.username ||
                            notification.action_user?.full_name ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1">
                        {renderNotificationContent(notification)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
