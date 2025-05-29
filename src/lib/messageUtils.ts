// src/lib/messageUtils.ts - UPDATED to include recipient_id
import { supabase } from "./supabase";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  sender_profile?: {
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
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to send messages");
    }

    // Insert message with both sender_id and recipient_id
    const { error } = await (supabase as any).from("messages").insert({
      sender_id: userData.user.id,
      recipient_id: recipientId,
      content: content.trim(),
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
 * Get all conversations for the current user
 */
export async function getConversations(): Promise<ConversationSummary[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to view conversations");
    }

    const currentUserId = userData.user.id;

    // Get all messages involving the current user (as sender or recipient)
    const { data: messages, error: messagesError } = await (supabase as any)
      .from("messages")
      .select(
        `
        id,
        sender_id,
        recipient_id,
        content,
        created_at
      `
      )
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return [];
    }

    // Get unique user IDs from conversations (excluding current user)
    const uniqueUserIds = new Set<string>();
    messages.forEach((message: any) => {
      if (message.sender_id !== currentUserId) {
        uniqueUserIds.add(message.sender_id);
      }
      if (message.recipient_id !== currentUserId) {
        uniqueUserIds.add(message.recipient_id);
      }
    });

    const userIds = Array.from(uniqueUserIds);

    if (userIds.length === 0) {
      return [];
    }

    // Fetch profiles for all conversation partners
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create conversation summaries
    const conversations: Record<string, ConversationSummary> = {};

    messages.forEach((message: any) => {
      // Determine the other user in the conversation
      const otherUserId =
        message.sender_id === currentUserId
          ? message.recipient_id
          : message.sender_id;

      // Skip if we've already processed this conversation
      if (conversations[otherUserId]) {
        return;
      }

      // Find the profile of the other user
      const otherUserProfile = profiles?.find((p) => p.id === otherUserId);

      conversations[otherUserId] = {
        user_id: otherUserId,
        username: otherUserProfile?.username || null,
        full_name: otherUserProfile?.full_name || null,
        avatar_url: otherUserProfile?.avatar_url || null,
        last_message: message.content,
        last_message_date: message.created_at,
        unread_count: 0, // We'll implement this later when we add is_read column
      };
    });

    return Object.values(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

/**
 * Get messages for a conversation between current user and another user
 */
export async function getConversation(otherUserId: string): Promise<Message[]> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error("You must be logged in to view messages");
    }

    const currentUserId = userData.user.id;

    // Get all messages between current user and other user
    const { data: messages, error: messagesError } = await (supabase as any)
      .from("messages")
      .select(
        `
        id,
        sender_id,
        recipient_id,
        content,
        created_at
      `
      )
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw messagesError;
    }

    if (!messages || messages.length === 0) {
      return [];
    }

    // Get profiles for both users
    const userIds = [currentUserId, otherUserId];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Add sender profile to each message
    const messagesWithProfiles = messages.map((message: any) => ({
      ...message,
      sender_profile: profiles?.find((p) => p.id === message.sender_id) || null,
    }));

    return messagesWithProfiles;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return [];
  }
}

/**
 * Mark messages as read - NO-OP for now (until we add is_read column)
 */
export async function markMessagesAsRead(otherUserId: string): Promise<void> {
  // Do nothing for now - we'll implement this when we add is_read column
  console.log(
    `markMessagesAsRead called for user ${otherUserId} - no action taken`
  );
  return Promise.resolve();
}

/**
 * Mark all messages as read - NO-OP for now (until we add is_read column)
 */
export async function markAllMessagesAsRead(): Promise<void> {
  // Do nothing for now - we'll implement this when we add is_read column
  console.log("markAllMessagesAsRead called - no action taken");
  return Promise.resolve();
}

/**
 * Get unread message count - Always returns 0 for now (until we add is_read column)
 */
export async function getUnreadCount(): Promise<number> {
  // Always return 0 for now - we'll implement this when we add is_read column
  return 0;
}
