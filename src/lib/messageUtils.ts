// src/lib/messageUtils.ts
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

    // Get the current user
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

    if (error) throw error;

    return true;
  } catch (error) {
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

    // Get messages where current user is either sender or recipient
    const { data, error } = await (supabase as any)
      .from("messages")
      .select(
        `
        *,
        sender_profile:sender_id(username, full_name, avatar_url),
        recipient_profile:recipient_id(username, full_name, avatar_url)
      `
      )
      .or(
        `sender_id.eq.${userData.user.id},recipient_id.eq.${userData.user.id}`
      )
      .and(`sender_id.eq.${otherUserId},recipient_id.eq.${userData.user.id}`)
      .or(`sender_id.eq.${userData.user.id},recipient_id.eq.${otherUserId}`)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
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

    // Get all messages involving the current user
    const { data, error } = await (supabase as any)
      .from("messages")
      .select(
        `
        *,
        sender_profile:sender_id(username, full_name, avatar_url),
        recipient_profile:recipient_id(username, full_name, avatar_url)
      `
      )
      .or(
        `sender_id.eq.${userData.user.id},recipient_id.eq.${userData.user.id}`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Process the messages to get unique conversations
    const conversations: Record<string, ConversationSummary> = {};
    const currentUserId = userData.user.id;

    data.forEach((message: Message) => {
      // Determine the other user in the conversation
      const otherUserId =
        message.sender_id === currentUserId
          ? message.recipient_id
          : message.sender_id;

      // Get the profile of the other user
      const otherUserProfile =
        message.sender_id === currentUserId
          ? message.recipient_profile
          : message.sender_profile;

      // If this is the first/latest message for this conversation, add it
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          user_id: otherUserId,
          username: otherUserProfile?.username || null,
          full_name: otherUserProfile?.full_name || null,
          avatar_url: otherUserProfile?.avatar_url || null,
          last_message: message.content,
          last_message_date: message.created_at,
          unread_count: 0,
        };
      }

      // Count unread messages
      if (message.recipient_id === currentUserId && !message.is_read) {
        conversations[otherUserId].unread_count++;
      }
    });

    return Object.values(conversations);
  } catch (error) {
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

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error marking messages as read:", error);
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

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
}
