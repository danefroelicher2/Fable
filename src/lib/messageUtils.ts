// src/lib/messageUtils.ts - COMPLETE FIX
import { supabase } from "./supabase";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  recipient_profile?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ConversationSummary {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  last_message: string;
  last_message_date: string;
  unread_count: number;
}

/**
 * Send a message to another user
 */
export async function sendMessage(
  recipientId: string,
  content: string
): Promise<boolean> {
  try {
    if (!content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to send messages");
    }

    // Send the message
    const { error } = await (supabase as any).from("messages").insert({
      sender_id: userData.user.id,
      recipient_id: recipientId,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error inserting message:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error sending message:", error);
    return false;
  }
}

/**
 * Get all messages between current user and another user
 */
export async function getConversation(otherUserId: string): Promise<Message[]> {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to view messages");
    }

    const currentUserId = userData.user.id;

    // First, get all messages between the two users
    const { data: messagesData, error: messagesError } = await (supabase as any)
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    // No messages found
    if (!messagesData || messagesData.length === 0) {
      return [];
    }

    // Get profile data for sender and recipient separately
    // First, get other user's profile
    const { data: otherUserProfile, error: otherUserError } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("id", otherUserId)
      .single();

    if (otherUserError && otherUserError.code !== "PGRST116") {
      console.error("Error fetching other user profile:", otherUserError);
    }

    // Then get current user's profile
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("id", currentUserId)
      .single();

    if (currentUserError && currentUserError.code !== "PGRST116") {
      console.error("Error fetching current user profile:", currentUserError);
    }

    // Add profile data to messages
    const messagesWithProfiles = messagesData.map((message: any) => {
      const enrichedMessage: Message = {
        ...message,
        sender_profile:
          message.sender_id === currentUserId
            ? currentUserProfile || null
            : otherUserProfile || null,
        recipient_profile:
          message.recipient_id === currentUserId
            ? currentUserProfile || null
            : otherUserProfile || null,
      };
      return enrichedMessage;
    });

    return messagesWithProfiles;
  } catch (error: any) {
    console.error("Error getting conversation:", error);
    return [];
  }
}

/**
 * Get a list of unique users the current user has conversations with
 */
export async function getConversations(): Promise<ConversationSummary[]> {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to view conversations");
    }

    const currentUserId = userData.user.id;

    // Get all messages involving the current user
    const { data: messagesData, error: messagesError } = await (supabase as any)
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    if (!messagesData || messagesData.length === 0) {
      return [];
    }

    // Get unique user IDs from conversations
    const uniqueUserIds = new Set<string>();
    messagesData.forEach((message: any) => {
      if (message.sender_id !== currentUserId) {
        uniqueUserIds.add(message.sender_id);
      }
      if (message.recipient_id !== currentUserId) {
        uniqueUserIds.add(message.recipient_id);
      }
    });

    // Fetch profiles for all unique users
    const userProfiles: Record<string, any> = {};

    // Only fetch if there are users to fetch
    if (uniqueUserIds.size > 0) {
      const userIds = Array.from(uniqueUserIds);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      } else if (profilesData) {
        // Index profiles by ID for easy lookup
        profilesData.forEach((profile: any) => {
          userProfiles[profile.id] = profile;
        });
      }
    }

    // Process the messages to get unique conversations
    const conversations: Record<string, ConversationSummary> = {};

    messagesData.forEach((message: any) => {
      // Determine the other user in the conversation
      const otherUserId =
        message.sender_id === currentUserId
          ? message.recipient_id
          : message.sender_id;

      // Skip if we've already processed this user
      if (conversations[otherUserId]) {
        // Just count unread messages
        if (message.recipient_id === currentUserId && !message.is_read) {
          conversations[otherUserId].unread_count++;
        }
        return;
      }

      // Get the profile of the other user
      const otherUserProfile = userProfiles[otherUserId] || {
        username: null,
        full_name: null,
        avatar_url: null,
      };

      // Add to conversations
      conversations[otherUserId] = {
        user_id: otherUserId,
        username: otherUserProfile.username || null,
        full_name: otherUserProfile.full_name || null,
        avatar_url: otherUserProfile.avatar_url || null,
        last_message: message.content,
        last_message_date: message.created_at,
        unread_count:
          message.recipient_id === currentUserId && !message.is_read ? 1 : 0,
      };
    });

    return Object.values(conversations);
  } catch (error: any) {
    console.error("Error getting conversations:", error);
    return [];
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  otherUserId: string
): Promise<boolean> {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to update messages");
    }

    // Mark messages as read
    const { error } = await (supabase as any)
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", otherUserId)
      .eq("recipient_id", userData.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    return false;
  }
}

/**
 * Mark all messages as read for the current user
 * This is used when a user visits the messages page
 */
export async function markAllMessagesAsRead(): Promise<boolean> {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to update messages");
    }

    // Mark all messages as read where the current user is the recipient
    const { error } = await (supabase as any)
      .from("messages")
      .update({ is_read: true })
      .eq("recipient_id", userData.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all messages as read:", error);
      throw error;
    }

    return true;
  } catch (error: any) {
    console.error("Error marking all messages as read:", error);
    return false;
  }
}

/**
 * Get unread message count
 */
export async function getUnreadCount(): Promise<number> {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return 0;
    }

    // Count unread messages
    const { count, error } = await (supabase as any)
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userData.user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error getting unread message count:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
}
